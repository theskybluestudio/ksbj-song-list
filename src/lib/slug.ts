export const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const buildArtistSlug = (name: string) => slugify(name || "unknown-artist");

export const buildSongSlug = (title: string, artist: string) => slugify(`${title || "unknown-song"}-${artist || "unknown-artist"}`);
