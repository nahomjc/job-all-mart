import { Markup } from "telegraf";
import {
  requiredChannelJoinUrl,
  requiredChannelLabel,
} from "@/lib/telegram/required-channel";

/** Reply-keyboard labels (must match handler routing exactly). */
export const MAIN_MENU = {
  POST_JOB: "📝 Post a job",
  HELP: "❓ Help",
  CONTACT: "📞 Contact",
} as const;

const MAIN_MENU_VALUES = new Set<string>(Object.values(MAIN_MENU));

export function isMainMenuButton(text: string): boolean {
  return MAIN_MENU_VALUES.has(text.trim());
}

/** Persistent menu below the text input for job posters. */
export function mainMenuKeyboard() {
  return Markup.keyboard([
    [MAIN_MENU.POST_JOB],
    [MAIN_MENU.HELP, MAIN_MENU.CONTACT],
  ])
    .resize()
    .persistent();
}

export function removeMainMenuKeyboard() {
  return Markup.removeKeyboard();
}

/** Opens the group/channel users must join before /postjob. */
export function joinRequiredChannelKeyboard() {
  return Markup.inlineKeyboard([
    Markup.button.url(`Join ${requiredChannelLabel()}`, requiredChannelJoinUrl()),
  ]);
}
