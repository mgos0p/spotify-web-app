import React from "react";

interface PlaylistsProps {
  playlists: SpotifyPlaylistsResponse;
}

export const Playlists: React.FC<PlaylistsProps> = ({ playlists }) => {
  const itemClass =
    "bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors duration-300 ease-in-out flex items-center";
  return (
    <section
      id="playlists"
      className="bg-gray-800 text-white p-5 rounded-lg shadow-lg my-6 mx-auto max-w-4xl"
    >
      <h2 className="text-2xl font-bold mb-4">My Playlists</h2>
      <ul className="list-none space-y-2">
        {playlists.items.length > 0 &&
          playlists.items.map((item) => (
            <li key={item.id} className={itemClass}>
              <img
                src={item.images.length > 0 ? item.images[0].url : ""}
                alt={`Cover for ${item.name}`}
                className="w-16 h-16 mr-4 object-cover rounded"
              />
              <a
                href={`/playlists/${item.id}`}
                className="text-blue-400 hover:text-blue-300 flex-grow"
              >
                {item.name}
              </a>
            </li>
          ))}
      </ul>
    </section>
  );
};

