import { Sequelize } from "sequelize";
import VideoModel from "./models/video";
import PlaylistModel from "./models/playlist";

const sequelize = new Sequelize({
  dialect: "sqlite", // type of the database
  logging: false, // if you want to log out the states of the database
  storage: "./.database/db_dev.db", // database file path
  sync: {
    /**
     * if force enabled it will delete the database and recreate if there is any change of te structure of the DB
     * CAUTION: It's not recommended to enable force on production, it will delete the data every time
     */
    force: process.env.NODE_ENV === "development",
  },
});

const Video = VideoModel(sequelize);
const Playlist = PlaylistModel(sequelize);

// Associate Video with Playlist
Video.belongsToMany(Playlist, {
  through: "PlaylistVideos",
  /**
   * the unique id of the third table. if not set, it will make the playlistId a unique id.
   * Then , when you want to add two association of the same playlist, a UNIQUE CONSTRAINT error will be thrown
   * */
  uniqueKey: "pvs_id",
});

// Associate Playlist with Video
Playlist.belongsToMany(Video, {
  through: "PlaylistVideos",
  uniqueKey: "pvs_id",
});

/**
 * sync function creates the tables and the association defined.
 * If not called, the tables won't be created!
 */
SyncDB();

async function SyncDB() {
  await sequelize.sync();
}

async function VideoExists(video_id) {
  if (typeof video_id !== "string") {
    throw new Error("VideoID must be a string");
  }

  let video = await Video.count({
    where: {
      video_id,
    },
  });

  return video > 0;
}

async function CreateVideo(videoData, playlistId) {
  if (!videoData) throw new Error("videoData must be a valid object");

  if (typeof videoData !== "object")
    throw new Error("videoData must be a object");

  let video = await Video.create(videoData);

  if (
    typeof playlistId === "number" ||
    (Array.isArray(playlistId) &&
      playlistId.every((pl) => typeof pl === "number"))
  ) {
    let playlist = await Playlist.findAll({ where: { id: playlistId } });
    await video.addPlaylists(playlist);
  }

  return video;
}

async function ReadVideo(id, withPlaylist = false) {
  let videos;
  if (Array.isArray(id) && id.every((i) => typeof i === "number")) {
    if (withPlaylist) {
      videos = await Video.findAll({ where: { id }, include: Playlist });
    } else {
      videos = await Video.findAll({ where: { id } });
    }
    return videos.map((video) => {
      return video.toJSON();
    });
  }

  if (typeof id === "number") {
    if (withPlaylist) {
      videos = await Video.findOne({ where: { id }, include: Playlist });
    } else {
      videos = await Video.findOne({ where: { id } });
    }
    return videos.toJSON();
  }

  if (withPlaylist) {
    videos = await Video.findAll({ include: Playlist });
  } else {
    videos = await Video.findAll();
  }

  return videos.map((video) => {
    return video.toJSON();
  });
}

async function UpdateVideo(id, videoData, playlistId) {
  if (typeof id === "number") {
    const video = await Video.findByPk(id);

    if (typeof videoData === "object") {
      video.update(videoData);
    }

    if (
      typeof playlistId === "number" ||
      (Array.isArray(playlistId) &&
        playlistId.every((id) => typeof id === "number"))
    ) {
      let playlist = await Playlist.findAll({ where: { id: playlistId } });

      await video.setPlaylists(playlist);
    } else {
      await video.setPlaylists([]);
    }

    return await video.save();
  }

  throw new Error(
    "Id must be a Number, and videoData must be Object or Playlist ID must be a number"
  );
}

async function DeleteVideo(id) {
  if (
    typeof id === "number" ||
    (Array.isArray(id) && id.every((i) => typeof i === "number"))
  ) {
    return Video.destroy({
      where: { id },
    });
  }

  throw new Error("id must be Number or Array of numbers");
}

async function CreatePlaylist(name) {
  if (!name) throw new Error("name must be a valid text");

  if (Array.isArray(name) && name.every((nm) => typeof nm === "string")) {
    return await Playlist.bulkCreate(
      name.map((nm) => {
        return { name: nm };
      })
    );
  }

  return await Playlist.create({ name });
}

async function ReadPlaylist(id, withVideos = false) {
  let playlists;
  if (Array.isArray(id) && id.every((i) => typeof i === "number")) {
    if (withVideos) {
      playlists = await Playlist.findAll({ where: { id }, include: Video });
    } else {
      playlists = await Playlist.findAll({ where: { id } });
    }
    return playlists.map((playlist) => {
      return playlist.toJSON();
    });
  }

  if (typeof id === "number") {
    if (withVideos) {
      playlists = await Playlist.findOne({ where: { id }, include: Video });
    } else {
      playlists = await Playlist.findOne({ where: { id } });
    }
    return playlists.toJSON();
  }

  if (withVideos) {
    playlists = await Playlist.findAll({ include: Video });
  } else {
    playlists = await Playlist.findAll();
  }

  return playlists.map((playlist) => {
    return playlist.toJSON();
  });
}

async function UpdatePlaylist(id, name) {
  if (
    (typeof id === "number" && typeof name === "string") ||
    (Array.isArray(id) && id.every((i) => typeof i === "number"))
  ) {
    return await Playlist.update(
      { name },
      {
        where: {
          id,
        },
      }
    );
  }

  throw new Error("Id must be a Number and Name must be String");
}

async function DeletePlaylist(id) {
  if (
    typeof id === "number" ||
    (Array.isArray(id) && id.every((i) => typeof i === "number"))
  ) {
    return Playlist.destroy({
      where: { id },
    });
  }

  throw new Error("id must be Number or Array of numbers");
}

export {
  VideoExists,
  CreateVideo,
  ReadVideo,
  UpdateVideo,
  DeleteVideo,
  CreatePlaylist,
  ReadPlaylist,
  UpdatePlaylist,
  DeletePlaylist,
};