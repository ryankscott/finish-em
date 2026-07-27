/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** API URL - Base URL of your finish-em deployment, e.g. https://finish-em.<subdomain>.workers.dev */
  "apiUrl": string,
  /** Auth Token - sha256 of FINISH_EM_AUTH_SECRET. Leave blank if the API is unauthenticated. */
  "authToken"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `add-task` command */
  export type AddTask = ExtensionPreferences & {}
  /** Preferences accessible in the `today` command */
  export type Today = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `add-task` command */
  export type AddTask = {}
  /** Arguments passed to the `today` command */
  export type Today = {}
}

