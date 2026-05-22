"use client";

import React from 'react';
import { Camp } from '@/lib/types';
import { fmt, stars } from '@/lib/utils';
import { MapPin, Star, Zap, Heart, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CampCardProps {
  camp: Camp;
  onClick: (id: string) => void;
  onBook: (booking: any) => void;
  isWishlisted: boolean;
  onToggleWishlist: (id: string, e: React.MouseEvent) => void;
}

export default function CampCard({ camp, onClick, onBook, isWishlisted, onToggleWishlist }: CampCardProps) {
  const isPending = camp.status === 'pending_approval';
  const isHidden = camp.isHidden;
  
  const mockDates = [
    { start: '21-29 May' },
    { start: '1-9 Jun' },
    { start: '11-19 Jun' },
    { start: '21-29 Jun' },
    { start: '1-9 Jul' }
  ];

  const images = camp.campImages && camp.campImages.length > 0 
    ? camp.campImages 
    : ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'];

  return (
    <div 
      className={cn(
        "group bg-white rounded-[24px] overflow-hidden border border-slate-100 hover:border-slate-200 transition-all duration-500 cursor-pointer",
        (isPending || isHidden) && "opacity-75 grayscale-[20%]"
      )}
      onClick={() => onClick(camp.id)}
    >
      {/* Image Section with Carousel */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] m-2">
        <Carousel opts={{ loop: true }} className="w-full h-full">
          <CarouselContent className="-ml-0">
            {images.map((img, index) => (
              <CarouselItem key={index} className="pl-0 h-full">
                <img 
                  src={img} 
                  alt={`${camp.name} ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          
          {camp.isFeatured ? (
            <div className="absolute top-3 left-3 w-7 h-7 bg-orange-500 text-white flex items-center justify-center rounded-lg shadow-lg z-10">
              <Star size={14} fill="currentColor" />
            </div>
          ) : (
            <div className="absolute top-3 left-3 w-6 h-6 bg-primary text-white flex items-center justify-center rounded-sm shadow-lg z-10">
              <Zap size={14} fill="currentColor" />
            </div>
          )}

          {isHidden && (
            <div className="absolute top-3 left-12 h-7 px-3 bg-slate-800 text-white flex items-center justify-center rounded-lg shadow-lg z-10 gap-2">
               <EyeOff size={12} />
               <span className="text-[8px] font-medium uppercase tracking-widest">Hidden</span>
            </div>
          )}

          <button 
            onClick={(e) => onToggleWishlist(camp.id, e)}
            className={cn(
              "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10",
              isWishlisted ? "bg-white text-destructive" : "bg-black/10 text-white hover:bg-black/30 backdrop-blur-md"
            )}
          >
            <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
          </button>

          <div className="absolute bottom-4 left-4 text-white text-[10px] font-medium tracking-widest uppercase z-10">
            D/N
          </div>

          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <CarouselPrevious className="relative left-0 translate-y-0 h-8 w-8 bg-white/20 border-white/30 text-white hover:bg-white/40" />
            <CarouselNext className="relative right-0 translate-y-0 h-8 w-8 bg-white/20 border-white/30 text-white hover:bg-white/40" />
          </div>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, i) => (
              <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all", i === 0 ? "bg-white scale-125" : "bg-white/40")} />
            ))}
          </div>
        </Carousel>
      </div>

      {/* Content Section */}
      <div className="p-4 pt-2 flex flex-col h-full min-h-[180px]">
        <h3 className="text-[13px] font-medium text-slate-800 mb-2 line-clamp-2 leading-snug tracking-tight group-hover:text-primary transition-colors">
          {camp.name}
        </h3>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <MapPin size={12} className="text-orange-500" />
            <span className="truncate max-w-[150px] uppercase tracking-tight">{camp.location}</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-800 text-white px-2 py-0.5 rounded-md text-[10px] font-medium">
            <Star size={10} fill="currentColor" className="text-white" />
            <span>{camp.rating || 5}</span>
          </div>
        </div>

        {/* Date Pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {mockDates.map((date, i) => (
            <div 
              key={i} 
              className="text-[9px] font-medium px-2 py-1 border border-dashed border-orange-500/40 text-orange-600 rounded-md hover:bg-orange-50 transition-colors"
            >
              {date.start}
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div className="mt-auto flex justify-between items-center">
          <div>
            <div className="text-sm font-medium text-slate-800">
              From ₹{camp.price.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-500">/pax</span>
            </div>
          </div>
          <button 
            disabled={isPending || isHidden}
            onClick={(e) => { e.stopPropagation(); onBook(camp); }}
            className={cn(
              "px-5 py-2 rounded-2xl text-[10px] font-medium uppercase tracking-widest border transition-all",
              (isPending || isHidden)
                ? "bg-slate-50 text-slate-400 border-slate-100" 
                : "border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500"
            )}
          >
            {isPending ? 'PENDING' : isHidden ? 'OFFLINE' : 'BOOK'}
          </button>
        </div>
      </div>
    </div>
  );
}
