import React from "react";

interface UserProfile {
  display_name: string;
  images: Array<{ url: string }>;
  id: string;
  email: string;
  uri: string;
  external_urls?: { spotify: string };
  followers?: { href: string; total: number };
  href: string;
}

interface ProfileProps {
  profile: UserProfile;
}

export const Profile: React.FC<ProfileProps> = ({ profile }) => {
  return (
    <>
      <section
        id="profile"
        className="bg-gray-800 text-white p-5 rounded-lg shadow-lg my-6 mx-auto max-w-4xl"
      >
        <h2 className="text-2xl font-bold mb-3">
          Logged in as {profile.display_name}
        </h2>
        {profile.images?.length > 0 && (
          <img
            id="avatar"
            className="w-48 h-48 object-cover rounded-full mx-auto mb-4"
            src={profile.images[0].url}
            alt="Avatar"
          />
        )}
        <ul className="list-none space-y-2">
          <li>User ID: {profile.id}</li>
          <li>Email: {profile.email}</li>
          <li>Followers: {profile.followers?.total ?? 0}</li>
          <li>
            Spotify URI:{" "}
            <a href={profile.uri} className="text-blue-400 hover:text-blue-300">
              {profile.uri}
            </a>
          </li>
          {profile.external_urls?.spotify && (
            <li>
              Link:{" "}
              <a
                href={profile.external_urls.spotify}
                className="text-blue-400 hover:text-blue-300"
              >
                Profile Link
              </a>
            </li>
          )}
        </ul>
      </section>
      <section
        id="pages"
        className="bg-gray-700 text-white p-4 rounded-lg shadow my-4 mx-auto max-w-4xl"
      >
        <h2 className="text-xl font-bold mb-2">Pages</h2>
        <ul className="list-none">
          <li>
            <a href="/playlists" className="text-blue-400 hover:text-blue-300">
              playlists
            </a>
          </li>
        </ul>
      </section>
    </>
  );
};
