
import { Candidate } from '@/components/candidates/types';
import { supabase } from '@/integrations/supabase/client';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

// India timezone
const INDIA_TIMEZONE = 'Asia/Kolkata';

// Convert date to India timezone for storage
const toIndiaTimezone = (date: Date): string => {
  // Convert the date to India timezone and format as ISO string
  const indiaDate = toZonedTime(date, INDIA_TIMEZONE);
  return formatInTimeZone(indiaDate, INDIA_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
};

// Convert ISO string from database to India timezone Date object
const fromIndiaTimezone = (isoString: string): Date => {
  // Parse the date and ensure it's treated as India timezone
  return toZonedTime(new Date(isoString), INDIA_TIMEZONE);
};

export const candidateService = {
  // Clean up existing manager names in the database
  async normalizeExistingManagers(): Promise<void> {
    console.log('Starting manager name normalization...');
    
    try {
      // Fetch all candidates with non-empty manager names
      const { data: candidates, error: fetchError } = await supabase
        .from('candidates')
        .select('id, Manager')
        .not('Manager', 'is', null)
        .neq('Manager', '');

      if (fetchError) {
        throw new Error(`Failed to fetch candidates: ${fetchError.message}`);
      }

      if (!candidates || candidates.length === 0) {
        console.log('No candidates with manager names found');
        return;
      }

      console.log(`Found ${candidates.length} candidates with manager names`);

      // Process candidates in batches to normalize manager names
      const updates: Array<{ id: string; normalizedManager: string }> = [];
      
      for (const candidate of candidates) {
        const originalManager = candidate.Manager || '';
        const normalizedManager = originalManager.trim();
        
        // Only update if normalization changed the value
        if (originalManager !== normalizedManager) {
          updates.push({
            id: candidate.id,
            normalizedManager
          });
        }
      }

      if (updates.length === 0) {
        console.log('No manager names need normalization');
        return;
      }

      console.log(`Normalizing ${updates.length} manager names...`);

      // Update candidates with normalized manager names
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('candidates')
          .update({ Manager: update.normalizedManager })
          .eq('id', update.id);

        if (updateError) {
          console.error(`Failed to normalize manager for candidate ${update.id}:`, updateError);
        }
      }

      console.log('Manager name normalization completed successfully');
    } catch (error) {
      console.error('Error during manager name normalization:', error);
      throw error;
    }
  },

  async saveCandidate(candidate: Candidate, isUpdating: boolean = false): Promise<Candidate> {
    console.log('SAVE CANDIDATE DEBUG - Input candidate:', {
      id: candidate.id,
      clientId: candidate.clientId,
      position: candidate.position,
      manager: candidate.manager, // Add manager to debug log
      clientIdLength: candidate.clientId?.length,
      positionLength: candidate.position?.length
    });

    // Normalize manager name - trim spaces and handle empty strings
    const normalizedManager = candidate.manager ? candidate.manager.trim() : '';
    
    // Ensure we have valid values for clientId
    const safeClientId = candidate.clientId && candidate.clientId.trim() !== '' ? candidate.clientId : null;
    
    // For new candidates, let Supabase generate the UUID
    // For updates, ensure we have a valid existing ID
    const safeCandidateId = isUpdating && candidate.id && candidate.id.trim() !== '' ? candidate.id : null;
    
    console.log('SAVE CANDIDATE DEBUG - After validation:', {
      safeClientId,
      safeCandidateId,
      originalClientId: candidate.clientId,
      originalId: candidate.id,
      manager: candidate.manager, // Add manager to debug log
      isUpdating
    });

    const currentTimestamp = toIndiaTimezone(new Date());
    
    if (isUpdating) {
      // For updates, we must have a valid candidate ID
      if (!safeCandidateId) {
        throw new Error('Cannot update candidate without a valid ID.');
      }

      const updateData = {
        name: candidate.name,
        contact_number: candidate.contactNumber,
        email: candidate.email,
        interview_date: candidate.interviewDate ? toIndiaTimezone(candidate.interviewDate) : null,
        interview_time: candidate.interviewTime || '',
        interview_round: candidate.interviewRound || '',
        interview_mode: candidate.interviewMode || '',
        status1: candidate.status1 || '',
        status2: candidate.status2 || '',
        client_id: safeClientId,
        client_name: candidate.clientName || '',
        position: candidate.position || '',
        recruiter_name: candidate.recruiterName || '',
        date_informed: candidate.dateInformed ? toIndiaTimezone(candidate.dateInformed) : null,
        remarks: candidate.remarks || '',
        Manager: normalizedManager, // FIXED: Save normalized manager name
        updated_at: currentTimestamp,
      };

      console.log('SAVE CANDIDATE DEBUG - Update data:', updateData);

      const { data, error } = await supabase
        .from('candidates')
        .update(updateData)
        .eq('id', safeCandidateId)
        .select()
        .single();

      if (error) {
        console.error('SAVE CANDIDATE DEBUG - Update error:', error);
        throw new Error(`Failed to update candidate: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from update operation');
      }

      // FIXED: Return the updated candidate with proper manager field mapping
      const updatedCandidate: Candidate = {
        id: data.id,
        name: data.name,
        contactNumber: data.contact_number,
        email: data.email,
        interviewDate: data.interview_date ? fromIndiaTimezone(data.interview_date) : null,
        interviewTime: data.interview_time,
        interviewRound: data.interview_round,
        interviewMode: data.interview_mode,
        status1: data.status1,
        status2: data.status2,
        clientId: data.client_id,
        clientName: data.client_name,
        position: data.position,
        recruiterName: data.recruiter_name,
        dateInformed: data.date_informed ? fromIndiaTimezone(data.date_informed) : null,
        remarks: data.remarks || '',
        manager: data.Manager || '', // FIXED: Properly map Manager field from database
      };

      console.log('SAVE CANDIDATE DEBUG - Updated candidate with manager:', {
        id: updatedCandidate.id,
        manager: updatedCandidate.manager
      });
      return updatedCandidate;
    } else {
      // For new candidates, let Supabase auto-generate the UUID
      const insertData = {
        name: candidate.name,
        contact_number: candidate.contactNumber,
        email: candidate.email,
        interview_date: candidate.interviewDate ? toIndiaTimezone(candidate.interviewDate) : null,
        interview_time: candidate.interviewTime || '',
        interview_round: candidate.interviewRound || '',
        interview_mode: candidate.interviewMode || '',
        status1: candidate.status1 || '',
        status2: candidate.status2 || '',
        client_id: safeClientId,
        client_name: candidate.clientName || '',
        position: candidate.position || '',
        recruiter_name: candidate.recruiterName || '',
        date_informed: candidate.dateInformed ? toIndiaTimezone(candidate.dateInformed) : null,
        remarks: candidate.remarks || '',
        Manager: normalizedManager, // FIXED: Save normalized manager name
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
      };

      console.log('SAVE CANDIDATE DEBUG - Insert data:', insertData);

      const { data, error } = await supabase
        .from('candidates')
        .insert(insertData)
        .select()
        .single();
        
      if (error) {
        console.error('SAVE CANDIDATE DEBUG - Insert error:', error);
        throw new Error(`Failed to save candidate: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from insert operation');
      }

      // FIXED: Return the candidate with proper manager field mapping
      const savedCandidate: Candidate = {
        id: data.id, // This will be the auto-generated UUID from Supabase
        name: data.name,
        contactNumber: data.contact_number,
        email: data.email,
        interviewDate: data.interview_date ? fromIndiaTimezone(data.interview_date) : null,
        interviewTime: data.interview_time,
        interviewRound: data.interview_round,
        interviewMode: data.interview_mode,
        status1: data.status1,
        status2: data.status2,
        clientId: data.client_id,
        clientName: data.client_name,
        position: data.position,
        recruiterName: data.recruiter_name,
        dateInformed: data.date_informed ? fromIndiaTimezone(data.date_informed) : null,
        remarks: data.remarks || '',
        manager: data.Manager || '', // FIXED: Properly map Manager field from database
      };

      console.log('SAVE CANDIDATE DEBUG - Saved candidate with manager:', {
        id: savedCandidate.id,
        manager: savedCandidate.manager
      });
      return savedCandidate;
    }
  },

  async fetchCandidates(searchTerm: string): Promise<Candidate[]> {
    let query = supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });
  
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }
  
    const { data, error } = await query;
  
    if (error) {
      console.error('Error fetching candidates:', error);
      throw new Error(`Failed to fetch candidates: ${error.message}`);
    }
  
    // FIXED: Map Supabase data to the Candidate type with proper manager field mapping
    const candidates: Candidate[] = data.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      contactNumber: candidate.contact_number,
      email: candidate.email,
      interviewDate: candidate.interview_date ? fromIndiaTimezone(candidate.interview_date) : null,
      interviewTime: candidate.interview_time,
      interviewRound: candidate.interview_round,
      interviewMode: candidate.interview_mode,
      status1: candidate.status1,
      status2: candidate.status2,
      clientId: candidate.client_id,
      clientName: candidate.client_name,
      position: candidate.position,
      recruiterName: candidate.recruiter_name,
      dateInformed: candidate.date_informed ? fromIndiaTimezone(candidate.date_informed) : null,
      remarks: candidate.remarks || '',
      manager: candidate.Manager || '', // FIXED: Properly map Manager field from database
    }));
  
    console.log('FETCH CANDIDATES DEBUG - Sample candidate with manager:', {
      totalCount: candidates.length,
      firstCandidateManager: candidates[0]?.manager
    });
  
    return candidates;
  },  

  async deleteCandidate(candidateId: string): Promise<void> {
    console.log('candidateService.deleteCandidate called with:', candidateId, 'type:', typeof candidateId);
    
    if (!candidateId || typeof candidateId !== 'string' || candidateId.trim() === '') {
      throw new Error('Cannot delete candidate: invalid or empty ID');
    }

    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', candidateId);

    if (error) {
      console.error('Error deleting candidate:', error);
      throw new Error(`Failed to delete candidate: ${error.message}`);
    }
  },
};
