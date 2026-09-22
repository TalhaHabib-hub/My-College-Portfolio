(function () {
  "use strict";

  var GH_USER = "TalhaHabib-hub";

  // ==============================
  // SELF-RATED SKILLS
  // ==============================
  var SKILLS = {
    "Frontend": 82,
    "Backend": 68,
    "AI integration": 55,
    "Tools & Git": 75,
    "Databases": 60
  };

  var COVE = [
    "#2a78d6",
    "#eb6834",
    "#1baf7a",
    "#eda100",
    "#e87ba4",
    "#008300",
    "#6250d6",
    "#e34948"
  ];

  var LANG_COLOR = {
    "JavaScript": "#eda100",
    "HTML": "#eb6834",
    "CSS": "#6250d6",
    "PHP": "#2a78d6",
    "Python": "#1baf7a",
    "C++": "#e87ba4",
    "TypeScript": "#2a78d6",
    "Java": "#e34948",
    "Blade": "#eb6834",
    "C": "#008300",
    "Shell": "#1baf7a"
  };

  // ==============================
  // ELEMENTS
  // ==============================
  var elRepos = document.getElementById("ghRepos");
  var elStars = document.getElementById("ghStars");
  var elLangs = document.getElementById("ghLangs");
  var elFollow = document.getElementById("ghFollow");

  var elStatus = document.getElementById("ghStatus");
  var elHeatmap = document.getElementById("ghHeatmap");
  var elHeatmapRange = document.getElementById("ghHeatmapRange");

  var elStackBar = document.getElementById("ghStackBar");
  var elStackBarLegend = document.getElementById("ghStackBarLegend");
  var elDonutLegend = document.getElementById("ghDonutLegend");

  if (!elRepos) return;


  // ==============================
  // ANIMATED COUNTER
  // ==============================
  function animateCount(el, target) {
    if (!el) return;

    target = Number(target) || 0;

    var startTime = null;
    var duration = 700;

    function step(ts) {
      if (!startTime) startTime = ts;

      var progress = Math.min(
        (ts - startTime) / duration,
        1
      );

      el.textContent = Math.floor(progress * target);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }


  // ==============================
  // LANGUAGE COLORS
  // ==============================
  function colorFor(name, index) {
    return LANG_COLOR[name] || COVE[index % COVE.length];
  }


  // ==============================
  // TOP LANGUAGES
  // ==============================
  function topLanguages(byteTotals, limit) {

    var keys = Object.keys(byteTotals);

    var grandTotal = keys.reduce(function (sum, key) {
      return sum + byteTotals[key];
    }, 0);

    var sorted = keys
      .map(function (name) {
        return {
          name: name,
          bytes: byteTotals[name]
        };
      })
      .sort(function (a, b) {
        return b.bytes - a.bytes;
      });

    var top = sorted.slice(0, limit);

    var rest = sorted
      .slice(limit)
      .reduce(function (sum, item) {
        return sum + item.bytes;
      }, 0);

    if (rest > 0) {
      top.push({
        name: "Other",
        bytes: rest
      });
    }

    return top.map(function (entry, index) {

      return {
        name: entry.name,
        bytes: entry.bytes,

        pct: grandTotal
          ? (entry.bytes / grandTotal) * 100
          : 0,

        color:
          entry.name === "Other"
            ? "#5a5a5a"
            : colorFor(entry.name, index)
      };

    });
  }


  // ==============================
  // DONUT
  // ==============================
  function renderDonut(langEntries) {

    var canvas = document.getElementById("ghDonut");

    if (!canvas || !window.Chart || !langEntries.length) {
      return;
    }

    var oldChart = Chart.getChart(canvas);

    if (oldChart) {
      oldChart.destroy();
    }

    new Chart(canvas, {

      type: "doughnut",

      data: {

        labels: langEntries.map(function (e) {
          return e.name;
        }),

        datasets: [{
          data: langEntries.map(function (e) {
            return Math.round(e.pct * 10) / 10;
          }),

          backgroundColor: langEntries.map(function (e) {
            return e.color;
          }),

          borderColor: "#10141C",
          borderWidth: 2
        }]
      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        cutout: "65%",

        plugins: {

          legend: {
            display: false
          },

          tooltip: {

            callbacks: {

              label: function (ctx) {

                return (
                  ctx.label +
                  ": " +
                  ctx.parsed +
                  "%"
                );

              }

            }

          }

        }

      }

    });


    if (elDonutLegend) {

      elDonutLegend.innerHTML =
        langEntries.map(function (e) {

          var pct =
            e.pct < 1
              ? e.pct.toFixed(1)
              : Math.round(e.pct);

          return (
            '<span class="gh-donut-legend__item">' +
              '<span class="gh-donut-legend__swatch" ' +
              'style="background:' + e.color + '"></span>' +
              e.name +
              " " +
              pct +
              "%" +
            "</span>"
          );

        }).join("");

    }

  }


  // ==============================
  // STACKED LANGUAGE BAR
  // ==============================
  function renderStackBar(langEntries) {

    if (!elStackBar) return;

    elStackBar.innerHTML =
      langEntries.map(function (e) {

        return (
          '<div class="gh-stackbar__segment" ' +
          'style="width:' + e.pct + '%;background:' +
          e.color + '">' +
          "</div>"
        );

      }).join("");


    if (elStackBarLegend) {

      elStackBarLegend.innerHTML =
        langEntries.map(function (e) {

          var pct =
            e.pct < 1
              ? e.pct.toFixed(1)
              : Math.round(e.pct);

          return (
            '<span class="gh-stackbar__legend-item">' +
              '<span class="gh-stackbar__legend-swatch" ' +
              'style="background:' + e.color + '"></span>' +
              e.name +
              " " +
              pct +
              "%" +
            "</span>"
          );

        }).join("");

    }

  }


  // ==============================
  // RADAR
  // ==============================
  function renderRadar() {

    var canvas =
      document.getElementById("ghRadar");

    if (!canvas || !window.Chart) {
      return;
    }

    var oldChart = Chart.getChart(canvas);

    if (oldChart) {
      oldChart.destroy();
    }

    var labels = Object.keys(SKILLS);

    var data = labels.map(function (key) {
      return SKILLS[key];
    });


    new Chart(canvas, {

      type: "radar",

      data: {

        labels: labels,

        datasets: [{

          data: data,

          backgroundColor:
            "rgba(47, 230, 221, 0.18)",

          borderColor:
            "#2FE6DD",

          pointBackgroundColor:
            "#2FE6DD",

          borderWidth: 2

        }]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

          legend: {
            display: false
          }

        },

        scales: {

          r: {

            beginAtZero: true,

            max: 100,

            ticks: {
              display: false
            },

            grid: {
              color: "rgba(255,255,255,0.08)"
            },

            angleLines: {
              color: "rgba(255,255,255,0.08)"
            },

            pointLabels: {

              color: "#9CA5B8",

              font: {
                size: 11
              }

            }

          }

        }

      }

    });

  }


  // ==================================================
  // REAL GITHUB CONTRIBUTION HEATMAP
  // ==================================================
  function renderHeatmap(contributions) {

    if (!elHeatmap) return;

    elHeatmap.innerHTML = "";

    /*
      GitHub contribution API returns:

      {
        date: "2026-08-10",
        count: 5,
        level: 3
      }
    */

    var data = {};

    contributions.forEach(function (item) {

      data[item.date] = {
        count: Number(item.count) || 0,
        level: Number(item.level) || 0
      };

    });


    // Last 90 days
    var today = new Date();

    var cells = [];

    for (var i = 89; i >= 0; i--) {

      var d = new Date(today);

      d.setDate(d.getDate() - i);

      var key =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0");


      var item = data[key] || {
        count: 0,
        level: 0
      };


      cells.push({

        date: key,

        count: item.count,

        level: item.level

      });

    }


    // Create cells
    cells.forEach(function (item) {

      var cell =
        document.createElement("div");

      cell.className =
        "gh-heatmap__cell";

      cell.setAttribute(
        "data-level",
        item.level
      );

      cell.title =
        item.date +
        ": " +
        item.count +
        " contribution" +
        (item.count === 1 ? "" : "s");

      elHeatmap.appendChild(cell);

    });


    elHeatmapRange.textContent =
      "Last 90 days of GitHub contributions";

  }


  // ==================================================
  // LOAD REAL CONTRIBUTION DATA
  // ==================================================
  function loadContributionHeatmap() {

    var url =
      "https://github-contributions-api.jogruber.de/v4/" +
      GH_USER +
      "?y=last";


    fetch(url)

      .then(function (response) {

        if (!response.ok) {
          throw new Error(
            "Contribution API error"
          );
        }

        return response.json();

      })

      .then(function (data) {

        if (
          !data ||
          !Array.isArray(data.contributions)
        ) {
          throw new Error(
            "Invalid contribution data"
          );
        }

        renderHeatmap(
          data.contributions
        );

      })

      .catch(function (error) {

        console.error(
          "GitHub contribution error:",
          error
        );

        elHeatmapRange.textContent =
          "GitHub contributions temporarily unavailable";

      });

  }


  // ==================================================
  // LOAD USER STATS
  // ==================================================
  function loadUserStats() {

    var url =
      "https://api.github.com/users/" +
      GH_USER;


    fetch(url)

      .then(function (response) {

        if (!response.ok) {
          throw new Error(
            "GitHub user API error"
          );
        }

        return response.json();

      })

      .then(function (user) {

        animateCount(
          elRepos,
          user.public_repos || 0
        );

        animateCount(
          elFollow,
          user.followers || 0
        );

      })

      .catch(function (error) {

        console.error(
          "User stats error:",
          error
        );

        elRepos.textContent = "—";
        elFollow.textContent = "—";

      });

  }


  // ==================================================
  // LOAD REPOSITORIES + LANGUAGES
  // ==================================================
  function loadRepositories() {

    var url =
      "https://api.github.com/users/" +
      GH_USER +
      "/repos?per_page=100";


    fetch(url)

      .then(function (response) {

        if (!response.ok) {
          throw new Error(
            "GitHub repositories API error"
          );
        }

        return response.json();

      })

      .then(function (repos) {

        var totalStars = repos.reduce(
          function (sum, repo) {

            return sum +
              (repo.stargazers_count || 0);

          },
          0
        );


        animateCount(
          elStars,
          totalStars
        );


        var langFetches =
          repos
            .filter(function (repo) {
              return !repo.fork;
            })
            .map(function (repo) {

              return fetch(
                repo.languages_url
              )

                .then(function (response) {

                  return response.ok
                    ? response.json()
                    : {};

                })

                .catch(function () {
                  return {};
                });

            });


        return Promise.all(
          langFetches
        );

      })

      .then(function (langResults) {

        var byteTotals = {};


        langResults.forEach(
          function (langs) {

            Object.keys(langs).forEach(
              function (name) {

                byteTotals[name] =
                  (byteTotals[name] || 0) +
                  langs[name];

              }
            );

          }
        );


        var languageCount =
          Object.keys(byteTotals).length;


        animateCount(
          elLangs,
          languageCount
        );


        var langEntries =
          topLanguages(
            byteTotals,
            6
          );


        renderDonut(
          langEntries
        );

        renderStackBar(
          langEntries
        );

      })

      .catch(function (error) {

        console.error(
          "Repository error:",
          error
        );

        elStars.textContent = "—";
        elLangs.textContent = "—";

      });

  }


  // ==================================================
  // START EVERYTHING INDEPENDENTLY
  // ==================================================

  function start() {

    // Real contribution calendar
    loadContributionHeatmap();

    // GitHub profile stats
    loadUserStats();

    // Repositories + language graphs
    loadRepositories();

    // Static radar never depends on GitHub API
    renderRadar();

  }


  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start
    );

  } else {

    start();

  }

})();