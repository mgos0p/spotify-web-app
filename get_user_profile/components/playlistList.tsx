import React from "react";

interface PlaylistListProps {
  playlists: SpotifyPlaylistsResponse;
  onSelect: (pl: SpotifyPlaylistsResponse["items"][number]) => void;
}

export const PlaylistList: React.FC<PlaylistListProps> = ({
  playlists,
  onSelect,
}) => (
  <section>
    <h2 className="text-2xl font-bold mb-4">My Playlists</h2>
    <ul className="list-none space-y-2">
      {playlists.items.map((pl) => (
        <li
          key={pl.id}
          className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg flex items-center cursor-pointer"
          onClick={() => onSelect(pl)}
        >
          {pl.images.length > 0 && (
            <img
              src={pl.images[0].url}
              alt={pl.name}
              className="w-16 h-16 mr-4 object-cover rounded"
            />
          )}
          <span className="text-blue-400 hover:text-blue-300 flex-grow">
            {pl.name}
          </span>
        </li>
      ))}
    </ul>
  </section>
);
