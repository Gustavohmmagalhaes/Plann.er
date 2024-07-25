import logo from '../../../public/logo.svg';
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InviteGuestsModal } from "./invite-guests-modal";
import { ConfirmTripModal } from "./confirm-trip-modal";
import { DestinationsAndDateStep } from "./steps/destination-and-date-step";
import { InviteGuestsStep } from "./steps/invite-guests-step";
import { DateRange } from 'react-day-picker';
import { api } from '../../lib/axios';

export function CreateTripPage() {

  const navigate = useNavigate();

  const [isGuestsInputOpen, setIsGuestsInputOpen] = useState(false);
  const [isGuestsModalOpen, setIsGuestsModalOpen] = useState(false);
  const [emailsToInvite, setEmailsToInvite] = useState([
    'gustavo@32344.com.br'
  ])
  const [isConfirmTripModalOpen, setIsConfirmTripModalOpen] = useState(false);
  const [destination, setDestination] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [eventStarAndEndDates, setEventStarAndEndDates] = useState<DateRange| undefined>();



  function openGuestInput(){
    setIsGuestsInputOpen(true);
  }

  function closeGuestInput(){
    setIsGuestsInputOpen(false);
  }

  function openGuestModal(){
    setIsGuestsModalOpen(true);
  }

  function closeGuestModal(){
    setIsGuestsModalOpen(false);
  } 

  function openConfirmTripModal(){
    setIsConfirmTripModalOpen(true);
  }

  function closeConfirmTripModal(){
    setIsConfirmTripModalOpen(false);
  } 

  async function createTrip(event: FormEvent<HTMLFormElement>){
    event.preventDefault();
    
    console.log('Creating trip with the following details:');
    console.log('Destination:', destination);
    console.log('Start and End Dates:', eventStarAndEndDates);
    console.log('Emails to Invite:', emailsToInvite);
    console.log('Owner Name:', ownerName);
    console.log('Owner Email:', ownerEmail);
  
    if (!destination) {
      console.error('Destination is required');
      return;
    }
  
    if (!eventStarAndEndDates?.from || !eventStarAndEndDates?.to) {
      console.error('Both start and end dates are required');
      return;
    }
  
    if (emailsToInvite.length === 0) {
      console.error('At least one email is required to invite');
      return;
    }
  
    if (!ownerName || !ownerEmail) {
      console.error('Owner name and email are required');
      return;
    }
  
    try {
      const response = await api.post('/trips', {
        destination,
        starts_at: eventStarAndEndDates.from,
        ends_at: eventStarAndEndDates.to,
        emails_to_invite: emailsToInvite,
        owner_name: ownerName,
        owner_email: ownerEmail
      });
  
      const { tripId } = response.data;
      console.log('Trip created successfully with ID:', tripId);
      navigate(`/trips/${tripId}`);
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Failed to create trip. Please try again.');
    }
  }
  
  

  function addNewEmailToInvite(event: FormEvent<HTMLFormElement>){
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email')?.toString();

    if(!email){
      return
    }

    if(emailsToInvite.includes(email)){
      return
    }
    setEmailsToInvite([
      ...emailsToInvite,
      email
    ]);

    event.currentTarget.reset()
  } 

  function removeEmailFromInvites(emailToRemove:string){
    const newEmailList = emailsToInvite.filter(email => email !== emailToRemove)
    setEmailsToInvite(newEmailList);
  }

  return (
    <div className="h-screen flex items-center justify-center bg-patter bg-no-repeat bg-center">
      <div className="max-w-3xl w-full px-6 text-center space-y-10">
        <div className="flex flex-col items-center gap-3">
          <img src={logo} alt="plann.er" /> 
          <p className="text-zinc-300 text-lg">Convide seus amigos e planeje sua próxima viagem!</p>
        </div>

        <div className="space-y-4">

        <DestinationsAndDateStep
         closeGuestInput={closeGuestInput}
         isGuestsInputOpen={isGuestsInputOpen}
         openGuestInput={openGuestInput}
         setDestination={setDestination}
         setEventStarAndEndDates = {setEventStarAndEndDates}
         eventStarAndEndDates = {eventStarAndEndDates}
        />
         
        {isGuestsInputOpen && (
          <InviteGuestsStep
            emailsToInvite={emailsToInvite}
            openConfirmTripModal={openConfirmTripModal}
            openGuestModal={openGuestModal}
          />
        )}
        </div>    
        

        <p className="text-sm text-zinc-500">
        Ao planejar sua viagem pela plann.er você automaticamente concorda <br />
        com nossos <a className="text-zinc-300 underline" href="#">termos de uso</a> e <a className="text-zinc-300 underline" href="#">políticas de privacidade</a>.
        </p>
      </div>

      {isGuestsModalOpen && (
        <InviteGuestsModal 
          emailsToInvite = {emailsToInvite}
          addNewEmailToInvite={addNewEmailToInvite}
          closeGuestModal={closeGuestModal}
          removeEmailFromInvites={removeEmailFromInvites}
        
        />
      )}

      {isConfirmTripModalOpen && (
        <ConfirmTripModal
         closeConfirmTripModal={closeConfirmTripModal}
         createTrip={createTrip}
         setOwnerEmail = {setOwnerEmail}
         setOwnerName = {setOwnerName}
        />
      )}
    </div>
  )
}

