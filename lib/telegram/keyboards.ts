import { Markup } from "telegraf";
import {
  requiredChannelJoinUrl,
  requiredChannelLabel,
} from "@/lib/telegram/required-channel";

/** Opens the group/channel users must join before /postjob. */
export function joinRequiredChannelKeyboard() {
  return Markup.inlineKeyboard([
    Markup.button.url(`Join ${requiredChannelLabel()}`, requiredChannelJoinUrl()),
  ]);
}
