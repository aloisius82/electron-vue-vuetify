import { DataTypes, Model } from "sequelize";

const PlaylistModel = (sequelize) => {
  class Playlist extends Model {}

  Playlist.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Playlist",
      tableName: "playlists",
      timestamps: false,
    }
  );

  return Playlist;
};

export default PlaylistModel;