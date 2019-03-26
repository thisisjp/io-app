declare module "redux-persist-fs-storage" {
  import RNFS from "react-native-fs";
  import { Storage } from "redux-persist";

  function FSStorage(location?: string = RNFS.DocumentDirectoryPath): Storage;

  export default FSStorage;
}
