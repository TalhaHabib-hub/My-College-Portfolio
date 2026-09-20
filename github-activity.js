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

  // Nice display names / colors for common languages
  var LANG_COLOR = {
    "JavaScript": "#F1E05A",
    "HTML": "#E34C26",
    "CSS": "#563D7C",
    "PHP": "#4F5D95",
    "Python": "#3572A5",
    "C++": "#F34B7D",
    "TypeScript": "#3178C6",
    "Java": "#B07219"
  };

  function animateCount(el, target) {
    var start = 0;
    var duration = 700;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  function renderLangBars(counts, totalRepos) {
    var entries = Object.keys(counts)
      .map(function (name) { return { name: name, count: counts[name] }; })
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, 6);

    elBars.innerHTML = "";

    entries.forEach(function (entry) {
      var pct = Math.round((entry.count / totalRepos) * 100);
      var color = LANG_COLOR[entry.name] || "var(--accent)";

      var wrap = document.createElement("div");
      wrap.className = "gh-langbar";

      var top = document.createElement("div");
      top.className = "gh-langbar__top";
      top.innerHTML =
        '<span class="gh-langbar__name">' + entry.name + "</span>" +
        "<span>" + pct + "% of repos</span>";

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

      // animate width after insertion
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
        var user = results[0];
        var repos = results[1];

        var totalStars = repos.reduce(function (sum, repo) {
          return sum + (repo.stargazers_count || 0);
        }, 0);

        var langCounts = {};
        repos.forEach(function (repo) {
          if (repo.language) {
            langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
          }
        });
        var langCount = Object.keys(langCounts).length;

        animateCount(elRepos, user.public_repos || repos.length);
        animateCount(elStars, totalStars);
        animateCount(elLangs, langCount);
        animateCount(elFollow, user.followers || 0);

        renderLangBars(langCounts, repos.length || 1);

        elStatus.textContent = "";
      })
      .catch(function () {
        // Graceful fallback if the API is rate-limited or offline —
        // keeps the section looking intentional instead of broken.
        elRepos.textContent = "15+";
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