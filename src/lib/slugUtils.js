// Generate a random 6-character slug
export const generateSlug = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let slug = '';
    for (let i = 0; i < 6; i++) {
        slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return slug;
};

// Check if slug exists and generate a unique one
export const generateUniqueSlug = async (supabase) => {
    let slug = generateSlug();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        const { data, error } = await supabase
            .from('boards')
            .select('slug')
            .eq('slug', slug)
            .single();

        // If no board found with this slug, it's unique
        if (error && error.code === 'PGRST116') {
            return slug;
        }

        // Generate a new slug and try again
        slug = generateSlug();
        attempts++;
    }

    // Fallback: append timestamp if we can't find unique slug
    return generateSlug() + Date.now().toString(36).slice(-2);
};
