import type { Locale } from "./config"

// Every guest-facing string on the site. Admin pages stay in English.
const en = {
  // Passed to toLocaleString and friends
  intlLocale: "en-GB",

  meta: {
    title: "Embassy Cinema | Intimate Film Experience",
    description:
      "Experience cinema the way it was meant to be. Just 6 seats, one screen, and unforgettable films at Embassy Cinema. Free bookings available.",
    shareDescription:
      "Experience cinema the way it was meant to be. Just 6 seats, one screen, and unforgettable films. Free bookings available.",
  },

  common: {
    homeLabel: "Embassy Cinema home",
    signedInAs: "Signed in as",
    seat: (label: string) => `Seat ${label}`,
    backHome: "Back to home",
    soldOut: "Sold out",
  },

  header: {
    book: "Book",
    menu: "Menu",
    close: "Close",
    language: "Language",
    nowShowing: "Now Showing",
    bookASeat: "Book a Seat",
    archive: "Archive",
    about: "About",
    myBookings: "My Bookings",
    signIn: "Sign In",
    signOut: "Sign out",
  },

  hero: {
    imageAlt: "Inside Embassy Cinema",
    nextUp: "Next up",
    seatsLeft: (n: number) => `${n} ${n === 1 ? "seat" : "seats"} left, book →`,
    soldOut: "sold out",
    nothingScheduled: "Embassy Cinema · Finalborgo · New screenings soon",
  },

  ticker: ["Italy's smallest cinema", "Six seats", "One screen", "Every Wednesday in Finalborgo", "Always free"],

  programme: {
    nowShowing: "Now Showing",
    archive: "Archive",
    seatsLeft: (n: number) => `${n} ${n === 1 ? "seat" : "seats"} left — book →`,
    noUpcoming: "New screenings are on their way. Check back soon.",
    screened: (when: string) => `Screened ${when}`,
    noArchive: "Our first screening is coming up.",
  },

  features: {
    heading: "Why Embassy",
    items: [
      {
        title: "Intimate Setting",
        description:
          "Just 6 carefully arranged seats ensure an exclusive, personal viewing experience for every guest.",
      },
      {
        title: "Curated Selection",
        description: "From timeless classics to hidden gems, our programming celebrates the art of cinema.",
      },
      {
        title: "Premium Sound",
        description: "Crystal-clear audio designed for a small space—hear every whisper and score note.",
      },
      {
        title: "Always Free",
        description: "We believe great cinema should be accessible to everyone. No tickets, just pure enjoyment.",
      },
    ],
  },

  footer: {
    tagline: "A passion project dedicated to the art of film. Finalborgo, Italy.",
    bookASeat: "Book a seat",
    myBookings: "My bookings",
    admin: "Admin",
  },

  book: {
    kicker: (max: number) => `Free admission · Six seats · Up to ${max} per guest`,
    title: "Book a seat",
    yourFilm: "Your film",
    change: "Change",
    pickYourSeat: "Pick your seat",
    noShowsTitle: "No upcoming shows",
    noShowsBody: "Check back soon for new screenings!",
  },

  seats: {
    screen: "Screen",
    seatLabel: (label: string, bookedBy?: string) =>
      `Seat ${label}${bookedBy ? ` (booked by ${bookedBy})` : ""}`,
    available: "Available",
    yourPick: "Your pick",
    taken: "Taken",
    completeTitle: "Complete your booking",
    summary: (max: number) => `· free admission · up to ${max} seats per guest`,
    verifyEmail: "Verify your email",
    confirmSeat: "Confirm your seat",
    limitReached: (max: number) =>
      `You've already booked ${max} seats for this screening, the maximum per guest. You can change or cancel them in`,
    yourName: "Your name",
    namePlaceholder: "Enter your name",
    nameHint: "We'll give this name at the door. No ticket needed.",
    booking: "Booking...",
    confirmButton: (label: string) => `Confirm seat ${label}`,
    genericError: "Something went wrong. Please try again.",
    successTitle: "You're booked!",
    successBody: (label: string, email: string) =>
      `Your seat ${label} has been reserved. A confirmation has been sent to ${email}.`,
    successFree: "Remember: All screenings are free. Just show up and enjoy the film!",
    successLimit: (max: number) => `That's the maximum of ${max} seats per guest for this screening.`,
    bookAnother: "Book Another Seat",
  },

  signIn: {
    title: "Sign In",
    description: "We'll email you a sign-in code. No password needed.",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    sending: "Sending...",
    sendCode: "Email me a sign-in code",
    // Supabase's own message (e.g. a rate limit) is in English, so we show it as is
    sendFailed: (message: string) => message,
    codeSent: "We sent a code to",
    codeSentAfter: ". Enter it below to continue here.",
    codeLabel: "Sign-in code",
    badCode: "That code didn't work. Check the latest email and try again.",
    checking: "Checking...",
    continue: "Continue",
    linkHint: "You can also tap the link in the email instead.",
    differentEmail: "Use a different email",
    errorTitle: "Authentication Error",
    errorBody: "Something went wrong during sign in. The link may have expired or already been used.",
    tryAgain: "Try Again",
  },

  dashboard: {
    title: "My bookings",
    upcoming: "Your upcoming bookings",
    emptyKicker: "Six seats · One screen · Always free",
    emptyTitle: "Your seat is waiting",
    emptyBody: "You haven't booked a screening yet. Pick a film below and save your seat in under a minute.",
    seeWhatsOn: "See what's on",
    comingUp: "Coming up",
    moreScreenings: "More screenings",
    yourArchive: "Your archive",
    filmsWatched: "Films you've watched",
    filmCount: (n: number) => `${n} ${n === 1 ? "film" : "films"} at Embassy Cinema`,
    watched: "Watched",
  },

  showtimeCard: {
    noSeats: "No seats available",
    seatsRemaining: (n: number) => `${n} ${n === 1 ? "seat" : "seats"} remaining`,
    reserve: "Reserve Seats",
  },

  bookingCard: {
    bookedFor: "Booked for",
    cancel: "Cancel Booking",
    confirmBefore: "Are you sure you want to cancel your booking for",
    confirmAfter: "? This action cannot be undone.",
    keep: "Keep Booking",
  },

  errors: {
    signInToBook: "You must be signed in to book a seat",
    invalidSeat: "Invalid seat number",
    limitReached: (max: number) => `You can book up to ${max} seats per screening.`,
    seatTaken: "This seat has already been booked. Please choose another seat.",
    bookFailed: "Failed to create booking. Please try again.",
    signInToCancel: "You must be logged in to cancel a booking",
    bookingNotFound: "Booking not found",
    notYourBooking: "You can only cancel your own bookings",
    pastScreening: "Cannot cancel bookings for past screenings",
    cancelFailed: "Failed to cancel booking. Please try again.",
  },
}

export type Dictionary = typeof en

const it: Dictionary = {
  intlLocale: "it-IT",

  meta: {
    title: "Embassy Cinema | Un'esperienza di cinema intima",
    description:
      "Il cinema come dovrebbe essere. Solo 6 posti, uno schermo e film indimenticabili all'Embassy Cinema. Prenotazione gratuita.",
    shareDescription:
      "Il cinema come dovrebbe essere. Solo 6 posti, uno schermo e film indimenticabili. Prenotazione gratuita.",
  },

  common: {
    homeLabel: "Embassy Cinema, pagina iniziale",
    signedInAs: "Accesso effettuato come",
    seat: (label) => `Posto ${label}`,
    backHome: "Torna alla home",
    soldOut: "Esaurito",
  },

  header: {
    book: "Prenota",
    menu: "Menu",
    close: "Chiudi",
    language: "Lingua",
    nowShowing: "In programma",
    bookASeat: "Prenota un posto",
    archive: "Archivio",
    about: "Chi siamo",
    myBookings: "Le mie prenotazioni",
    signIn: "Accedi",
    signOut: "Esci",
  },

  hero: {
    imageAlt: "L'interno dell'Embassy Cinema",
    nextUp: "Prossimo film",
    seatsLeft: (n) => (n === 1 ? "1 posto libero, prenota →" : `${n} posti liberi, prenota →`),
    soldOut: "tutto esaurito",
    nothingScheduled: "Embassy Cinema · Finalborgo · Nuove proiezioni in arrivo",
  },

  ticker: ["Il cinema più piccolo d'Italia", "Sei posti", "Uno schermo", "Ogni mercoledì a Finalborgo", "Sempre gratis"],

  programme: {
    nowShowing: "In programma",
    archive: "Archivio",
    seatsLeft: (n) => (n === 1 ? "1 posto libero — prenota →" : `${n} posti liberi — prenota →`),
    noUpcoming: "Nuove proiezioni in arrivo. Torna a trovarci presto.",
    screened: (when) => `Proiettato il ${when}`,
    noArchive: "La nostra prima proiezione è in arrivo.",
  },

  features: {
    heading: "Perché Embassy",
    items: [
      {
        title: "Ambiente intimo",
        description: "Solo 6 posti, disposti con cura, per una visione esclusiva e personale per ogni ospite.",
      },
      {
        title: "Selezione curata",
        description: "Dai grandi classici alle perle nascoste, la nostra programmazione celebra l'arte del cinema.",
      },
      {
        title: "Audio di qualità",
        description: "Un audio cristallino pensato per una sala piccola: ogni sussurro, ogni nota della colonna sonora.",
      },
      {
        title: "Sempre gratis",
        description: "Crediamo che il grande cinema debba essere per tutti. Niente biglietti, solo il piacere del film.",
      },
    ],
  },

  footer: {
    tagline: "Un progetto nato dalla passione per l'arte del cinema. Finalborgo, Italia.",
    bookASeat: "Prenota un posto",
    myBookings: "Le mie prenotazioni",
    admin: "Admin",
  },

  book: {
    kicker: (max) => `Ingresso gratuito · Sei posti · Massimo ${max} a persona`,
    title: "Prenota un posto",
    yourFilm: "Il tuo film",
    change: "Cambia",
    pickYourSeat: "Scegli il tuo posto",
    noShowsTitle: "Nessuna proiezione in programma",
    noShowsBody: "Torna presto per le nuove proiezioni!",
  },

  seats: {
    screen: "Schermo",
    seatLabel: (label, bookedBy) => `Posto ${label}${bookedBy ? ` (prenotato da ${bookedBy})` : ""}`,
    available: "Libero",
    yourPick: "La tua scelta",
    taken: "Occupato",
    completeTitle: "Completa la prenotazione",
    summary: (max) => `· ingresso gratuito · massimo ${max} posti a persona`,
    verifyEmail: "Verifica la tua email",
    confirmSeat: "Conferma il posto",
    limitReached: (max) =>
      `Hai già prenotato ${max} posti per questa proiezione, il massimo a persona. Puoi modificarli o annullarli dalla pagina`,
    yourName: "Il tuo nome",
    namePlaceholder: "Inserisci il tuo nome",
    nameHint: "Useremo questo nome all'ingresso. Non serve il biglietto.",
    booking: "Prenotazione in corso...",
    confirmButton: (label) => `Conferma il posto ${label}`,
    genericError: "Qualcosa è andato storto. Riprova.",
    successTitle: "Posto prenotato!",
    successBody: (label, email) => `Il posto ${label} è tuo. Ti abbiamo inviato una conferma a ${email}.`,
    successFree: "Ricorda: tutte le proiezioni sono gratuite. Vieni e goditi il film!",
    successLimit: (max) => `Hai raggiunto il massimo di ${max} posti a persona per questa proiezione.`,
    bookAnother: "Prenota un altro posto",
  },

  signIn: {
    title: "Accedi",
    description: "Ti invieremo un codice di accesso via email. Nessuna password.",
    emailLabel: "Indirizzo email",
    emailPlaceholder: "tu@esempio.it",
    sending: "Invio in corso...",
    sendCode: "Inviami un codice di accesso",
    sendFailed: () => "Non siamo riusciti a inviare il codice. Riprova tra qualche minuto.",
    codeSent: "Abbiamo inviato un codice a",
    codeSentAfter: ". Inseriscilo qui sotto per continuare.",
    codeLabel: "Codice di accesso",
    badCode: "Il codice non è valido. Controlla l'ultima email e riprova.",
    checking: "Verifica in corso...",
    continue: "Continua",
    linkHint: "In alternativa, puoi toccare il link nell'email.",
    differentEmail: "Usa un'altra email",
    errorTitle: "Errore di accesso",
    errorBody: "Qualcosa è andato storto durante l'accesso. Il link potrebbe essere scaduto o già usato.",
    tryAgain: "Riprova",
  },

  dashboard: {
    title: "Le mie prenotazioni",
    upcoming: "Le tue prossime prenotazioni",
    emptyKicker: "Sei posti · Uno schermo · Sempre gratis",
    emptyTitle: "Il tuo posto ti aspetta",
    emptyBody:
      "Non hai ancora prenotato nessuna proiezione. Scegli un film qui sotto e prenota il tuo posto in meno di un minuto.",
    seeWhatsOn: "Guarda il programma",
    comingUp: "In arrivo",
    moreScreenings: "Altre proiezioni",
    yourArchive: "Il tuo archivio",
    filmsWatched: "I film che hai visto",
    filmCount: (n) => `${n} film all'Embassy Cinema`,
    watched: "Visto",
  },

  showtimeCard: {
    noSeats: "Nessun posto disponibile",
    seatsRemaining: (n) => (n === 1 ? "1 posto disponibile" : `${n} posti disponibili`),
    reserve: "Prenota",
  },

  bookingCard: {
    bookedFor: "Prenotato a nome di",
    cancel: "Annulla prenotazione",
    confirmBefore: "Vuoi davvero annullare la prenotazione per",
    confirmAfter: "? Non potrai tornare indietro.",
    keep: "Mantieni la prenotazione",
  },

  errors: {
    signInToBook: "Devi accedere per prenotare un posto",
    invalidSeat: "Numero di posto non valido",
    limitReached: (max) => `Puoi prenotare al massimo ${max} posti per proiezione.`,
    seatTaken: "Questo posto è già stato prenotato. Scegline un altro.",
    bookFailed: "Non è stato possibile completare la prenotazione. Riprova.",
    signInToCancel: "Devi accedere per annullare una prenotazione",
    bookingNotFound: "Prenotazione non trovata",
    notYourBooking: "Puoi annullare solo le tue prenotazioni",
    pastScreening: "Non puoi annullare prenotazioni per proiezioni già passate",
    cancelFailed: "Non è stato possibile annullare la prenotazione. Riprova.",
  },
}

export const dictionaries: Record<Locale, Dictionary> = { en, it }
