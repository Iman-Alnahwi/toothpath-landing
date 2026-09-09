/*
  ═══ When a form is allowed to turn red ═════════════════════════════════════

  The rules were written once per page and drifted apart. /staff waited until
  someone typed; /admin reddened three fields the instant the dialog opened,
  telling the reader off for not having typed yet. Same app, opposite manners.

  So the timing lives here, once, and every form asks the same question.

  Three moments, in the order a person actually meets them:

    1. Untouched and nothing submitted → silence. An empty field is not a
       mistake yet.
    2. Something in the field → speak as they type, and — because the message
       is derived, not stored — the red clears itself the moment the value
       becomes valid. Nothing has to «dismiss» it.
    3. They left the field, or pressed the button → say what is missing. This
       is the case the app used to have no answer for: a required field left
       empty stayed silent, and the reader was left facing a dead button with
       nothing telling them why.

  Point 3 is why the submit button must NOT be disabled on validity alone.
  A disabled button is the one control that cannot explain itself: it does not
  fire, so it cannot say what is wrong, and the reader's only move is to guess
  which field it dislikes. Let the press land, mark `tried`, and answer.
*/
import { computed, reactive, ref } from 'vue'

export function useFieldGate<K extends string>(
  /** The current problem per field: '' when the field is fine. */
  problems: () => Record<K, string>,
  /** The current value per field, to tell «untouched» from «typed something». */
  values: () => Record<K, unknown>,
) {
  /** Set by the submit handler; from then on, everything wrong is shown. */
  const tried = ref(false)
  /** Fields the reader has entered and left. */
  const blurred = reactive<Record<string, boolean>>({})

  function show(field: K): boolean {
    if (!problems()[field]) return false
    if (tried.value || blurred[field]) return true
    const v = values()[field]
    return typeof v === 'string' ? v.trim().length > 0 : Boolean(v)
  }

  function touch(field: K) {
    blurred[field] = true
  }

  /** Call when the dialog opens, so a fresh form starts quiet. */
  function reset() {
    tried.value = false
    for (const k of Object.keys(blurred)) delete blurred[k]
  }

  const valid = computed(() => !Object.values(problems()).some(Boolean))

  /**
   * The submit guard. Returns false — and reveals everything — when the form
   * is not ready, so a handler reads:  `if (!gate.attempt()) return`
   */
  function attempt(): boolean {
    tried.value = true
    return valid.value
  }

  return { tried, show, touch, reset, valid, attempt }
}
