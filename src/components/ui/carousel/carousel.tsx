
import * as React from "react"
import { UseEmblaCarouselType } from "embla-carousel-react"

import { cn } from "@/lib/utils"

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  opts?: React.MutableRefObject<UseEmblaCarouselType | undefined>
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, opts, children, ...props }, ref) => {
    return (
      <div className={cn("relative", className)} {...props} ref={ref}>
        {children}
      </div>
    )
  }
)
Carousel.displayName = "Carousel"

interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex snap-x overflow-auto scroll-smooth",
          className
        )}
        {...props}
        ref={ref}
      >
        {children}
      </div>
    )
  }
)
CarouselContent.displayName = "CarouselContent"

interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn("min-w-full snap-start", className)}
        {...props}
        ref={ref}
      >
        {children}
      </div>
    )
  }
)
CarouselItem.displayName = "CarouselItem"

interface CarouselNextProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  opts?: React.MutableRefObject<UseEmblaCarouselType | undefined>
}

const CarouselNext = React.forwardRef<HTMLButtonElement, CarouselNextProps>(
  ({ className, opts, ...props }, ref) => {
    return (
      <button
        className={cn(
          "absolute top-1/2 z-10 -translate-y-1/2 right-2 rounded-full bg-background p-1.5 text-foreground shadow-md",
          className
        )}
        onClick={() => {
          // Use optional chaining and type check to safely call scrollNext
          if (opts?.current && 'scrollNext' in opts.current) {
            (opts.current as any).scrollNext();
          }
        }}
        type="button"
        aria-label="Next slide"
        {...props}
        ref={ref}
      />
    )
  }
)
CarouselNext.displayName = "CarouselNext"

interface CarouselPreviousProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  opts?: React.MutableRefObject<UseEmblaCarouselType | undefined>
}

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  CarouselPreviousProps
>(({ className, opts, ...props }, ref) => {
  return (
    <button
      className={cn(
        "absolute top-1/2 z-10 -translate-y-1/2 left-2 rounded-full bg-background p-1.5 text-foreground shadow-md",
        className
      )}
      onClick={() => {
        // Use optional chaining and type check to safely call scrollPrev
        if (opts?.current && 'scrollPrev' in opts.current) {
          (opts.current as any).scrollPrev();
        }
      }}
      type="button"
      aria-label="Previous slide"
      {...props}
      ref={ref}
    />
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
}
