import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Manager } from '@/types/manager';

export const useManagerManagement = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);

  // Load managers from localStorage
  useEffect(() => {
    const loadManagers = () => {
      try {
        setLoading(true);
        const savedManagers = localStorage.getItem('managers');
        if (savedManagers) {
          const parsedManagers = JSON.parse(savedManagers);
          setManagers(parsedManagers);
        }
      } catch (error) {
        console.error('Error loading managers:', error);
        toast({
          title: "Error loading managers",
          description: "Could not load managers from storage",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadManagers();
  }, []);

  // Save managers to localStorage
  const saveManagers = (managersToSave: Manager[]) => {
    try {
      localStorage.setItem('managers', JSON.stringify(managersToSave));
    } catch (error) {
      console.error('Error saving managers:', error);
      toast({
        title: "Error saving managers",
        description: "Could not save managers to storage",
        variant: "destructive"
      });
    }
  };

  const handleAddManager = async (name: string) => {
    try {
      const newManager: Manager = {
        id: `mgr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        isActive: true
      };
      
      const updatedManagers = [...managers, newManager].sort((a, b) => a.name.localeCompare(b.name));
      setManagers(updatedManagers);
      saveManagers(updatedManagers);
      
      toast({
        title: "Manager added successfully",
        description: `${name} has been added to the managers list`
      });
    } catch (error) {
      console.error('Error adding manager:', error);
      toast({
        title: "Error adding manager",
        description: "Could not add the manager. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditManager = async (id: string, name: string) => {
    try {
      const updatedManagers = managers.map(manager => 
        manager.id === id ? { ...manager, name: name.trim() } : manager
      ).sort((a, b) => a.name.localeCompare(b.name));
      
      setManagers(updatedManagers);
      saveManagers(updatedManagers);

      toast({
        title: "Manager updated successfully",
        description: `Manager name has been updated to ${name}`
      });
    } catch (error) {
      console.error('Error updating manager:', error);
      toast({
        title: "Error updating manager",
        description: "Could not update the manager. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteManager = async (id: string) => {
    try {
      const updatedManagers = managers.filter(manager => manager.id !== id);
      setManagers(updatedManagers);
      saveManagers(updatedManagers);

      toast({
        title: "Manager deleted successfully",
        description: "The manager has been permanently removed"
      });
    } catch (error) {
      console.error('Error deleting manager:', error);
      toast({
        title: "Error deleting manager",
        description: "Could not delete the manager. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const manager = managers.find(m => m.id === id);
      if (!manager) return;

      const newStatus = !manager.isActive;
      
      const updatedManagers = managers.map(m => 
        m.id === id ? { ...m, isActive: newStatus } : m
      );
      
      setManagers(updatedManagers);
      saveManagers(updatedManagers);

      toast({
        title: "Manager status updated",
        description: `Manager has been marked as ${newStatus ? 'active' : 'inactive'}`
      });
    } catch (error) {
      console.error('Error updating manager status:', error);
      toast({
        title: "Error updating manager status",
        description: "Could not update the manager status. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    managers,
    loading,
    handleAddManager,
    handleEditManager,
    handleDeleteManager,
    handleToggleStatus
  };
};