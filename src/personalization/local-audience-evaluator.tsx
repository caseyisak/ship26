'use client';

/**
 * LocalAudienceEvaluator
 *
 * Why this exists:
 * The NT cloud evaluates audience rules server-side and returns matched audience IDs in
 * profile.audiences. For this to work, the NT Personalization app must be connected to
 * the same Contentful environment the app is using. When that connection is missing
 * (e.g., a new `wow` env where NT app hasn't been re-installed yet), NT cloud returns
 * no WOW audience IDs, so variants never swap.
 *
 * This component evaluates audience rules *client-side* using the same rules stored
 * in Contentful, then drives the preview plugin's activateAudience() so its middleware
 * forces the correct variant to render. Works without NT cloud sync.
 *
 * Long-term: connect NT app to each new Contentful env in the NT dashboard to get
 * proper cloud evaluation + analytics. This component stays harmless when cloud works
 * (cloud sets audienceOverwrites before we do; we just reinforce it).
 *
 * Implementation note — why we use onProfileChange:
 * All identify() callers in this app use useNinetailed().identify() — the React hook
 * returns the Ninetailed class instance directly from context. After every identify()
 * call, _flush() dispatches PROFILE_CHANGE on the internal analytics event bus.
 * onProfileChange subscribes to that same event bus, so it reliably fires regardless
 * of which code path called identify(). The profileState argument includes
 * profile.traits with the just-identified traits, which we use to evaluate rules
 * and activate the correct audiences in the preview plugin.
 */

import { useNinetailed } from '@ninetailed/experience.js-react';
import { useEffect } from 'react';

import { useLocalAudiences } from './local-audience-context';

type AudienceRule = {
  type?: string;
  key?: string;
  operator?: string;
  value?: unknown;
  count?: number;
};

type AudienceRuleBlock = {
  all?: AudienceRule | AudienceRule[];
};

type AudienceRules = {
  any?: AudienceRuleBlock[];
};

type MappedAudience = {
  id: string;
  name: string;
  rules?: unknown;
};

function evaluateRules(
  rules: AudienceRules | undefined,
  traits: Record<string, unknown>,
): boolean {
  if (!rules?.any?.length) return false;

  return rules.any.some((anyBlock) => {
    const allConditions = Array.isArray(anyBlock.all)
      ? anyBlock.all
      : anyBlock.all
        ? [anyBlock.all]
        : [];
    if (!allConditions.length) return false;

    return allConditions.every((cond) => {
      if (cond.type !== 'identify') return false; // page/track rules not evaluated locally — NT cloud handles those
      const traitVal = traits[cond.key ?? ''];
      const ruleVal = cond.value;
      switch (cond.operator) {
        case 'equal':
          return traitVal === ruleVal || String(traitVal) === String(ruleVal);
        case 'notEqual':
          return traitVal !== ruleVal && String(traitVal) !== String(ruleVal);
        case 'contains':
          return String(traitVal).includes(String(ruleVal ?? ''));
        case 'greaterThan':
          return Number(traitVal) > Number(ruleVal);
        case 'greaterThanInclusive':
          return Number(traitVal) >= Number(ruleVal);
        case 'lessThan':
          return Number(traitVal) < Number(ruleVal);
        case 'lessThanInclusive':
          return Number(traitVal) <= Number(ruleVal);
        default:
          return false;
      }
    });
  });
}

type WindowPreviewPlugin = {
  activateAudience: (id: string) => void;
  resetAudience: (id: string) => void;
};

function getPreviewPlugin(): WindowPreviewPlugin | null {
  if (typeof window === 'undefined') return null;
  // NT preview plugin exposes itself at window.ninetailed.plugins.preview
  // This is set during preview plugin initialize() only on the active instance.
  const plugin = (
    window as unknown as { ninetailed?: { plugins?: { preview?: unknown } } }
  ).ninetailed?.plugins?.preview;
  if (
    plugin &&
    typeof (plugin as Record<string, unknown>).activateAudience ===
      'function' &&
    typeof (plugin as Record<string, unknown>).resetAudience === 'function'
  ) {
    return plugin as WindowPreviewPlugin;
  }
  return null;
}

/**
 * Retry wrapper for getPreviewPlugin().
 *
 * The preview plugin attaches to window.ninetailed.plugins.preview during
 * its initialize() lifecycle. If onProfileChange fires before initialize()
 * completes, getPreviewPlugin() returns null and audience activation is
 * silently lost. This function retries with a short interval to cover that
 * init window.
 */
function waitForPreviewPlugin(
  callback: (plugin: WindowPreviewPlugin) => void,
  maxAttempts = 10,
  intervalMs = 200,
) {
  let attempts = 0;
  const check = () => {
    const plugin = getPreviewPlugin();
    if (plugin) {
      callback(plugin);
      return;
    }
    attempts++;
    if (attempts < maxAttempts) {
      setTimeout(check, intervalMs);
    }
  };
  check();
}

export function LocalAudienceEvaluator({
  audiences,
}: {
  audiences: MappedAudience[];
}) {
  const ninetailed = useNinetailed();
  const { setMatchedAudienceIds } = useLocalAudiences();

  useEffect(() => {
    const unsubscribe = ninetailed.onProfileChange((profileState) => {
      const traits = (profileState.profile?.traits ?? {}) as Record<
        string,
        unknown
      >;

      // Evaluate all audience rules against current traits
      const matched: string[] = [];
      audiences.forEach((audience) => {
        if (evaluateRules(audience.rules as AudienceRules, traits)) {
          matched.push(audience.id);
        }
      });

      // Write matched IDs to shared context so panels can read them
      setMatchedAudienceIds(matched);

      // Activate/reset audiences on the preview plugin (with retry for init timing)
      waitForPreviewPlugin((previewPlugin) => {
        audiences.forEach((audience) => {
          if (matched.includes(audience.id)) {
            previewPlugin.activateAudience(audience.id);
          } else {
            previewPlugin.resetAudience(audience.id);
          }
        });
      });
    });

    return unsubscribe;
  }, [ninetailed, audiences, setMatchedAudienceIds]);

  return null;
}
