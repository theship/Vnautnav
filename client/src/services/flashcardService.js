// flashcardService.js
export const fetchFlashcards = async (filter = null) => {
    let url = 'http://localhost:3030/flashcards';
    if (filter !== null) {
        url += `?filter=${filter}`;
    }
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
        throw error; // Rethrow to handle it in the calling component
    }
};

export const postFlashcardResponse = async ({ flashcardId, gotIt }) => {
    const url = 'http://localhost:3030/flashcardResponse';
    const user = localStorage.getItem('username');
    if (!user) {
        throw new Error("User is not logged in.");
    }

    const headers = {
        'Content-Type': 'application/json',
    };

    const body = JSON.stringify({
        username: user,
        flashcardId,
        gotIt
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body,
        });
        return response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error; // Rethrow to handle it in the calling component
    }
};
