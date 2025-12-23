import { connect } from 'getstream';

export const streamConfig = {
    apiKey: "4nuhn4y98bf7",
    appId: "1139766",
    // Token generation usually happens backend-side. 
    // For dev, we might use a user token that has permissions for both or separate.
};

// Helper to get feed client (for non-hook usage if needed)
export const getStreamFeedClient = (token: string) => {
    return connect(streamConfig.apiKey, token, streamConfig.appId);
};


