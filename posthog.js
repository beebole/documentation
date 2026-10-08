// PostHog for the help site (beebole.com/help, proxied to Mintlify).
// Mintlify runs every .js file at the root on every page, like pollen.js.
// The marketing site loads PostHog from its own code since 2026-10-02 and the
// GTM "Posthog" tag is paused, so the help pages carry their own copy.
// Same settings as website-next src/components/analytics/posthogSnippet.ts and
// the blog's copy (WordPress head): change all three together.
(function () {
  // One key per host: PROD on the live site, QA on the QA website. Anywhere
  // else (Mintlify previews, beebole.mintlify.app, blog.beebole.com) PostHog
  // is not loaded, so those visits never reach PROD.
  var PROD = 'phc_4TFHKRB1bMPjSggTtADINN7EnTZiSOTTppAZamGzrZL';
  var QA = 'phc_rtAHb98CaFqzqRPsPXtojUJMGiBOR3SndeCgIjmFykd';
  var KEYS = { 'beebole.com': PROD, 'www.beebole.com': PROD, 'web-qa.beebole.com': QA };
  var key = KEYS[window.location.hostname];
  if (!key) return;

  // Official loader stub: queues calls until /static/array.js has loaded.
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="rn sn init kn Qr wn Cn yn capture calculateEventProperties Rn register register_once register_for_session unregister unregister_for_session An getFeatureFlag getFeatureFlagPayload getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync Fn identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset setIdentity clearIdentity get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException addExceptionStep captureLog startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty On En createPersonProfile setInternalOrTestUser Ln gn $n opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing In debug Kr Pn getPageViewId captureTraceFeedback captureTraceMetric vn".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  // A referrer on one of our own domains is internal navigation, not a source:
  // record it as '$direct' so it never hides the real first touch.
  window.posthog.init(key, {
    api_host: 'https://p.beebole.com',
    ui_host: 'https://eu.posthog.com',
    defaults: '2026-05-30',
    person_profiles: 'identified_only',
    sanitize_properties: function (props) {
      var own = /(^|\.)(beebole\.com|beebole-apps\.com|beebole\.test|beebole-test\.com)$/;
      if (props.$referring_domain && own.test(props.$referring_domain)) {
        props.$referrer = '$direct';
        props.$referring_domain = '$direct';
      }
      if (props.$set_once && props.$set_once.$initial_referring_domain && own.test(props.$set_once.$initial_referring_domain)) {
        props.$set_once.$initial_referrer = '$direct';
        props.$set_once.$initial_referring_domain = '$direct';
      }
      return props;
    }
  });
})();
