export const STRINGS = {
    EVENTS: {
        HEADER_TITLE: 'Events',
        HEADER_SUBTITLE: "Discover what's happening nearby",
        HOST_EVENT: 'Host an Event',
        NO_EVENTS: 'No upcoming events',
        LOADING_ERROR: 'Failed to load events',
        BE_THE_FIRST: 'Be the first!',
        GOING_SUFFIX: 'going',
        INTERESTED_SUFFIX: 'interested',

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
        },

        REQUEST: {
            TITLE: 'Host an Event',
            SUBTITLE: 'Submit your event for review',
            FORM: {
                TITLE_LABEL: 'Event Title',
                TITLE_PLACEHOLDER: 'e.g. Diwali Night 2024',
                DATE_LABEL: 'Date & Time',
                LOCATION_LABEL: 'Location',
                LOCATION_PLACEHOLDER: 'e.g. Vondelpark, Amsterdam',
                DESC_LABEL: 'Description',
                DESC_PLACEHOLDER: 'Tell people what makes this event special...',
                PRICE_LABEL: 'Price (€)',
                PRICE_PLACEHOLDER: '0 for free',
                SUBMIT_BTN: 'Submit Request',
                SUBMITTING: 'Submitting...',
            },
            SUCCESS: {
                TITLE: 'Request Submitted',
                MSG: 'Thanks! Your event is under review and will appear once approved.',
            },
            ERROR: {
                TITLE: 'Submission Failed',
                MSG: 'Could not submit your request. Please try again.',
                MISSING_FIELDS: 'Please fill in all required fields.',
            }
        }
    },
    MARKETPLACE: {
        HEADER_TITLE: 'Marketplace',
        HEADER_SUBTITLE: 'Buy, sell, or rent within the community',
        FILTER_ALL: 'All',
        FILTER_HOUSING: 'Housing',
        FILTER_CLASSIFIEDS: 'Classifieds',
        NO_ITEMS: 'No items found matching your filter',
        LOADING_ERROR: 'Failed to load marketplace items',
        OFFERED_LABEL: 'Offered',
        WANTED_LABEL: 'Wanted',
        DETAILS: {
            ABOUT: 'About this item',
            LOCATION: 'Location',
            PRICE: 'Price',
            SELLER: 'Seller',
            CONTACT: 'Contact Seller',
            HOUSING: 'Housing',
            CLASSIFIED: 'Classified',
            NOT_FOUND: 'Listing not found',
            SHARE_MESSAGE: (title: string, price: number, location: string) =>
                `Check out this listing on NRI App!\n\n${title}\nPrice: €${price}\nLocation: ${location}`,
        },
        ADD: {
            TITLE: 'Create Listing',
            SUBTITLE: 'List an item or housing for the community',
            FORM: {
                TITLE_LABEL: 'Title',
                TITLE_PLACEHOLDER: 'e.g. Spacious Room in Amstelveen',
                CATEGORY_LABEL: 'Category',
                TYPE_LABEL: 'Listing Type',
                PRICE_LABEL: 'Price (€)',
                PRICE_PLACEHOLDER: '0 for free',
                LOCATION_LABEL: 'Location',
                LOCATION_PLACEHOLDER: 'e.g. Amsterdam Zuid',
                DESC_LABEL: 'Description',
                DESC_PLACEHOLDER: 'Provide details about what you are listing...',
                SUBMIT_BTN: 'Post Listing',
                SUBMITTING: 'Posting...',
            },
            SUCCESS: {
                TITLE: 'Listing Posted',
                MSG: 'Your listing is now live in the community marketplace!',
            }
        },
        FILTERS: {
            TITLE: 'Filter Listings',
            APPLY_BTN: 'Apply Filters',
            RESET_BTN: 'Reset',
            SECTION_CATEGORY: 'Category',
            SECTION_TYPE: 'Type',
            SECTION_LOCATION: 'Location',
            LOCATION_PLACEHOLDER: 'Search by city or area...',
        },
        SEARCH: {
            PLACEHOLDER: 'Search marketplace...',
            NOTE: 'Note: Full-text search is changing to Title-only for performance.',
        },
        ERRORS: {
            INDEX_REQUIRED: 'Database setup required. Please check console for the index creation link.',
            GENERIC: 'Something went wrong while loading listings.',
        }
    }
};
