import { ArrowRight, Calendar, MapPin, Settings2, X } from "lucide-react";
import { Button } from "../../../components/button";
import { useState } from "react";
import { DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {format} from 'date-fns'

interface DestinationsAndDateStepProps{
    isGuestsInputOpen: boolean;
    closeGuestInput: ()=>void;
    openGuestInput: ()=>void;
    setDestination: (destination:string)=>void;
    setEventStarAndEndDates: (dates: DateRange | undefined) => void;
    eventStarAndEndDates:DateRange| undefined;
}
export function DestinationsAndDateStep({closeGuestInput, isGuestsInputOpen, openGuestInput, setDestination, setEventStarAndEndDates, eventStarAndEndDates}: DestinationsAndDateStepProps){

  const [isDatePickerOpen,setIsDatePickerOpen] = useState(false);


  function openDatePicker(){
    return setIsDatePickerOpen(true);
  }

  function cleseDatePicker(){
    return setIsDatePickerOpen(false);
  }

  const displayedDate = eventStarAndEndDates && eventStarAndEndDates.from && eventStarAndEndDates.to ? format(eventStarAndEndDates.from, "d' de 'LLL").concat(' até ').concat(format(eventStarAndEndDates.to, "d 'de' LLL")) : null;

    return(
        <div className="h-16 bg-zinc-900 px-4 rounded-xl flex items-center shadow-shape gap-3">
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="size-5 text-zinc-400"/>
          <input onChange={event => setDestination(event.target.value)} disabled={isGuestsInputOpen} type="text" placeholder="Para onde você vai?" className="bg-transparent text-lg placeholder-zinc-400 outline-none flex-1"/>
      
        </div>

        <button onClick={openDatePicker} disabled={isGuestsInputOpen} className="flex items-center gap-2 text-left w-[240px]">
          <Calendar className="size-5 text-zinc-400"/>
          <span className="text-lg text-zinc-400 w-40 flex-1">
            {displayedDate || 'Quando?'}
          </span>
        </button>

        {isDatePickerOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className=" rounded-xl py-5 px-6 shadow-shape bg-zinc-900 space-y-5"> 
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Selecione a data</h2>
                <button type="button" onClick={cleseDatePicker} >
                  <X className="size-5 text-zinc-400 "/>
                </button>
              </div>
            </div>
  
            <div className="flex flex-wrap gap-2">
            </div>
            <DayPicker mode="range" selected={eventStarAndEndDates} onSelect={setEventStarAndEndDates}/>
          </div>
          </div>
        )}
        
        <div className="w-px h-6 bg-zinc-800"/>

        {isGuestsInputOpen ?  (
          <Button onClick = {closeGuestInput} variant="secondary">
            Alerar local/data
          <Settings2 className="size-5"/>
          </Button>
        ):(
         
          <Button onClick = {openGuestInput} variant="primary" >
          Continuar
          <ArrowRight className="size-5"/>
          </Button>
        )}

      </div>
    
    )
}