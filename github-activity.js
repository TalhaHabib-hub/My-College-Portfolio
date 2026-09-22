(function () {
  "use strict";

  var GH_USER = "TalhaHabib-hub"; // change this if you rename your GitHub account

  var elRepos   = document.getElementById("ghRepos");
  var elStars   = document.getElementById("ghStars");
  var elLangs   = document.getElementById("ghLangs");
  var elFollow  = document.getElementById("ghFollow");
  var elBars    = document.getElementById("ghLangBars");
  var elStatus  = document.getElementById("ghStatus");

  if (!elRepos) return; // section not on this page

  // Nice colors for common languages (falls back to accent teal if unlisted)
  var LANG_COLOR = {
    "JavaScript": "#F1E05A",
    "HTML": "#E34C26",
    "CSS": "#563D7C",
    "PHP": "#4F5D95",
    "Python": "#3572A5",
    "C++": "#F34B7D",
    "TypeScript": "#3178C6",
    "Java": "#B07219",
    "Blade": "#F7523F",
    "C": "#555555",
    "Shell": "#89E051"
  };

  function animateCount(el, target) {
    var startTime = null;
    var duration = 700;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  function renderLangBars(byteTotals) {
    var grandTotal = Object.keys(byteTotals).reduce(function (sum, k) {
      return sum + byteTotals[k];
    }, 0);

    var entries = Object.keys(byteTotals)
      .map(function (name) { return { name: name, bytes: byteTotals[name] }; })
      .sort(function (a, b) { return b.bytes - a.bytes; })
      .slice(0, 6);

    elBars.innerHTML = "";

    entries.forEach(function (entry) {
      var pct = grandTotal ? (entry.bytes / grandTotal) * 100 : 0;
      var pctLabel = pct < 1 ? pct.toFixed(1) : Math.round(pct);
      var color = LANG_COLOR[entry.name] || "var(--accent)";

      var wrap = document.createElement("div");
      wrap.className = "gh-langbar";

      var top = document.createElement("div");
      top.className = "gh-langbar__top";
      top.innerHTML =
        '<span class="gh-langbar__name">' + entry.name + "</span>" +
        "<span>" + pctLabel + "% of code</span>";

      var track = document.createElement("div");
      track.className = "gh-langbar__track";

      var fill = document.createElement("div");
      fill.className = "gh-langbar__fill";
      fill.style.background = color !== "var(--accent)"
        ? "linear-gradient(90deg, " + color + ", rgba(255,255,255,0.15))"
        : "";

      track.appendChild(fill);
      wrap.appendChild(top);
      wrap.appendChild(track);
      elBars.appendChild(wrap);

      window.setTimeout(function () { fill.style.width = pct + "%"; }, 60);
    });
  }

  function loadGitHubActivity() {
    var userUrl  = "https://api.github.com/users/" + GH_USER;
    var reposUrl = "https://api.github.com/users/" + GH_USER + "/repos?per_page=100";

    Promise.all([
      fetch(userUrl).then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); }),
      fetch(reposUrl).then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    ])
      .then(function (results) {
        var user  = results[0];
        var repos = results[1];

        var totalStars = repos.reduce(function (sum, repo) {
          return sum + (repo.stargazers_count || 0);
        }, 0);

        // Fetch each repo's real language byte-counts and merge them into
        // one grand total — this is the same method GitHub itself uses for
        // the language bar on your profile / repo pages.
        var langFetches = repos
          .filter(function (repo) { return !repo.fork; }) // skip forks, they aren't your code
          .map(function (repo) {
            return fetch(repo.languages_url)
              .then(function (r) { return r.ok ? r.json() : {}; })
              .catch(function () { return {}; });
          });

        return Promise.all(langFetches).then(function (langResults) {
          var byteTotals = {};
          langResults.forEach(function (langs) {
            Object.keys(langs).forEach(function (name) {
              byteTotals[name] = (byteTotals[name] || 0) + langs[name];
            });
          });

          animateCount(elRepos, user.public_repos || repos.length);
          animateCount(elStars, totalStars);
          animateCount(elLangs, Object.keys(byteTotals).length);
          animateCount(elFollow, user.followers || 0);

          renderLangBars(byteTotals);
          elStatus.textContent = "";
        });
      })
      .catch(function () {
        // Graceful fallback if the API is rate-limited or offline —
        // keeps the section looking intentional instead of broken.
        elRepos.textContent = "20+";
        elStars.textContent = "—";
        elLangs.textContent = "6+";
        elFollow.textContent = "—";
        elBars.innerHTML = "";
        elStatus.textContent = "Live stats temporarily unavailable — showing recent snapshot.";
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadGitHubActivity);
  } else {
    loadGitHubActivity();
  }
})();