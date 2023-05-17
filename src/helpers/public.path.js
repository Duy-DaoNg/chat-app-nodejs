import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const initialPath = path.join(__dirname + "/../", "public/");

export default initialPath;