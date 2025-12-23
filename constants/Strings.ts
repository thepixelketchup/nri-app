export const STRINGS = {
    EVENTS: {
        HEADER_TITLE: 'Events',
        HEADER_SUBTITLE: "Discover what's happening nearby",
        NO_EVENTS: 'No upcoming events',
        LOADING_ERROR: 'Failed to load events',
        BE_THE_FIRST: 'Be the first!',
        GOING_SUFFIX: 'going',

        DETAILS: {
            GOING: 'Going',
            NOT_GOING: 'Not Going',
            FREE: 'Free',
            ORGANIZER: 'Organizer',
            VIEW_ON_MAP: 'View on Map',
            ABOUT_TITLE: 'About Event',
            ATTENDEES_SUBTITLE: 'Including you and friends',
            ERROR_NOT_FOUND: 'Event not found',
            ERROR_RSVP_UPDATE: 'Failed to update RSVP.',
            SIGN_IN_TITLE: 'Sign In Required',
            SIGN_IN_MSG: 'Please sign in to RSVP.',
            SHARE_MESSAGE: (title: string, date: string, time: string, location: string) =>
                `Do you want to join ${title}?\n\n📅 ${date} at ${time}\n📍 ${location}\n\nCheck it out on the NRI App!`,
        },

        SUCCESS: {
            CONFIRMED: 'Confirmed',
            TITLE: (title: string) => `You're going to ${title}!`,
            SUBTITLE: 'Be ready to have a great time.',
            NEXT_STEPS_TITLE: 'Next Steps',

            ADD_CALENDAR_TITLE: 'Add to calendar',
            ADD_CALENDAR_SUBTITLE: 'Never miss the date',

            INVITE_TITLE: 'Invite friends',
            INVITE_SUBTITLE: 'More people, more fun',

            JOIN_CHAT_TITLE: 'Join Group Chat',
            JOIN_CHAT_SUBTITLE: 'Meet everyone before you go',

            SHARE_MESSAGE: (title: string, date: string, time: string, location: string) =>
                `I am going! Join me at ${title}!\n\n📅 ${date} at ${time}\n📍 ${location}\n\nIt's going to be great!`,

            CALENDAR: {
                PERM_TITLE: 'Permission needed',
                PERM_MSG: 'We need calendar permissions to add this event.',
                NO_WRITABLE: 'Could not find a writable calendar.',
                SUCCESS_TITLE: 'Success',
                SUCCESS_MSG: 'Event added to your calendar!',
                FAIL_PREFIX: 'Failed to add to calendar: ',
                ERROR_TITLE: 'Error',
            }
        }
    }
};
