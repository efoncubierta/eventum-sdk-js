import * as yaml from "js-yaml";
import * as fs from "fs";
import { EventumConfig } from "./EventumConfig";
import { SchemaValidator } from "../validation/SchemaValidator";

export class EventumConfigLoader {
  public static loadFromFile(configFile: string): EventumConfig {
    const eventumConfig = yaml.safeLoad(fs.readFileSync(configFile, "utf8"), { json: true });

    // validate configuration
    const result = SchemaValidator.validateEventumConfig(eventumConfig);
    if (result.errors.length > 0) {
      throw new Error(
        `Eventum configuration is not valid: ${result.errors[0].message}. Please review the eventum.yml file`
      );
    }

    return eventumConfig;
  }
}
