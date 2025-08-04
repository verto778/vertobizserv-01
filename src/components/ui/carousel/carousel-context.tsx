
import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { CarouselContextProps } from "./types"

export const CarouselContext = React.createContext<CarouselContextProps | null>(null)

export function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}
