(function () {
  "use strict";

  var body = document.body;
  var header = document.querySelector("[data-header]");
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  var searchPanel = document.querySelector("[data-search-panel]");
  var searchOpeners = document.querySelectorAll("[data-search-open]");
  var searchClosers = document.querySelectorAll("[data-search-close]");
  var lastFocusedElement = null;

  function normalizePath(link) {
    var url;
    try { url = new URL(link.href, window.location.href); } catch (error) { return link.href; }
    return url.origin + url.pathname.replace(/\/$/, "");
  }

  document.querySelectorAll(".top-nav, .mobile-menu").forEach(function (nav) {
    var seen = {};
    nav.querySelectorAll("a").forEach(function (link) {
      var key = normalizePath(link);
      if (seen[key]) {
        link.remove();
        return;
      }
      seen[key] = true;
      if (key === normalizePath({ href: window.location.href })) link.setAttribute("aria-current", "page");
    });
  });

  function closeMenu() {
    if (!menuButton || !mobileMenu) return;
    mobileMenu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
  }

  function toggleMenu() {
    if (!menuButton || !mobileMenu) return;
    var nextOpen = mobileMenu.hidden;
    mobileMenu.hidden = !nextOpen;
    menuButton.setAttribute("aria-expanded", String(nextOpen));
    body.classList.toggle("menu-open", nextOpen);
  }

  function openSearch() {
    if (!searchPanel) return;
    lastFocusedElement = document.activeElement;
    closeMenu();
    searchPanel.hidden = false;
    body.classList.add("search-open");
    window.setTimeout(function () {
      var input = searchPanel.querySelector("input[type='search']");
      if (input) input.focus();
    }, 30);
  }

  function closeSearch() {
    if (!searchPanel || searchPanel.hidden) return;
    searchPanel.hidden = true;
    body.classList.remove("search-open");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
  }

  if (menuButton) menuButton.addEventListener("click", toggleMenu);
  searchOpeners.forEach(function (button) { button.addEventListener("click", openSearch); });
  searchClosers.forEach(function (button) { button.addEventListener("click", closeSearch); });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSearch();
      closeMenu();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 1020) closeMenu();
  });

  window.addEventListener("scroll", function () {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);
  }, { passive: true });

  function showCopyResult(button, message) {
    var original = button.getAttribute("data-original-label") || button.textContent;
    button.setAttribute("data-original-label", original);
    button.textContent = message;
    button.classList.toggle("is-copy-error", message === "복사 실패");
    window.setTimeout(function () {
      button.textContent = original;
      button.classList.remove("is-copy-error");
    }, 4000);
  }

  function legacyCopy(text) {
    var input = document.createElement("textarea");
    var copied = false;
    input.value = text;
    input.setAttribute("readonly", "");
    input.setAttribute("aria-hidden", "true");
    input.style.position = "fixed";
    input.style.top = "0";
    input.style.left = "-9999px";
    input.style.width = "1px";
    input.style.height = "1px";
    document.body.appendChild(input);
    input.focus();
    input.select();
    input.setSelectionRange(0, input.value.length);
    try { copied = document.execCommand("copy"); } catch (error) { copied = false; }
    document.body.removeChild(input);
    return copied;
  }

  function copyPageLink(button) {
    var url = window.location.href.split("#")[0];

    // 사용자 클릭 이벤트 안에서 실행되는 호환 방식을 먼저 사용합니다.
    if (legacyCopy(url)) {
      showCopyResult(button, "복사 완료");
      return;
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(function () {
        showCopyResult(button, "복사 완료");
      }).catch(function () {
        showCopyResult(button, "복사 실패");
      });
      return;
    }

    showCopyResult(button, "복사 실패");
  }

  document.querySelectorAll("[data-copy-link]").forEach(function (button) {
    button.addEventListener("click", function () { copyPageLink(button); });
  });

  var articleContent = document.querySelector("[data-entry-content]");
  var progress = document.querySelector("[data-reading-progress]");
  var progressBar = progress && progress.querySelector("span");

  if (articleContent) {
    var aiDailyReport = articleContent.querySelector(".ai-daily-post");
    var vscodeGuide = articleContent.querySelector(".jcos-vscode-guide");
    var stockDailyReport = articleContent.querySelector(".mn-report[data-jcos-master-id='MASTER_STOCK_DAILY']");
    var jcosReport = aiDailyReport || vscodeGuide;
    if (jcosReport) {
      var articleView = articleContent.closest(".article-view");
      if (articleView) {
        articleView.classList.add("is-jcos-report");
        if (vscodeGuide) articleView.classList.add("is-jcos-vscode-report");
      }
    }
    if (stockDailyReport) {
      var stockArticleView = articleContent.closest(".article-view");
      if (stockArticleView) stockArticleView.classList.add("is-stock-daily-report");
    }

    var plainText = (articleContent.textContent || "").replace(/\s+/g, " ").trim();
    var readingTime = Math.max(1, Math.ceil(plainText.length / 500));
    var readingTimeTarget = document.querySelector("[data-reading-time]");
    if (readingTimeTarget) {
      readingTimeTarget.textContent = "약 " + readingTime + "분";
      readingTimeTarget.hidden = false;
    }

    var toc = document.querySelector("[data-toc]");
    var tocList = document.querySelector("[data-toc-list]");
    // JCOS reports ship a curated in-content TOC in their locked masters.
    // Do not replace it with the skin's generic heading collector.
    var headings = jcosReport ? [] : articleContent.querySelectorAll("h2, h3");
    var tocLinks = [];

    if (toc && tocList && headings.length >= 2) {
      var introAnchor = document.createElement("span");
      var introLink = document.createElement("a");
      introAnchor.id = "report-summary";
      introAnchor.className = "toc-anchor";
      introAnchor.setAttribute("aria-hidden", "true");
      articleContent.insertBefore(introAnchor, articleContent.firstChild);

      introLink.href = "#" + introAnchor.id;
      introLink.textContent = "리포트 요약";
      introLink.setAttribute("data-level", "2");
      tocList.appendChild(introLink);
      tocLinks.push(introLink);

      headings.forEach(function (heading, index) {
        if (!heading.id) heading.id = "report-section-" + (index + 1);
        var link = document.createElement("a");
        link.href = "#" + heading.id;
        link.textContent = heading.textContent.trim();
        link.setAttribute("data-level", heading.tagName.slice(1));
        tocList.appendChild(link);
        tocLinks.push(link);
      });
      toc.hidden = false;

      function activateTocLink(activeLink) {
        tocLinks.forEach(function (link) {
          var isActive = link === activeLink;
          link.classList.toggle("is-active", isActive);
          if (isActive) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }

      tocLinks.forEach(function (link) {
        link.addEventListener("click", function () { activateTocLink(link); });
      });

      var hashLink = tocLinks.filter(function (link) {
        return link.getAttribute("href") === window.location.hash;
      })[0];
      activateTocLink(hashLink || introLink);

      if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var activeLink = tocLinks.filter(function (link) {
              return link.getAttribute("href") === "#" + entry.target.id;
            })[0];
            if (activeLink) activateTocLink(activeLink);
          });
        }, { rootMargin: "-18% 0px -70% 0px" });
        observer.observe(introAnchor);
        headings.forEach(function (heading) { observer.observe(heading); });
      }
    }

    if (progress && progressBar) {
      progress.classList.add("is-active");
      var ticking = false;
      function updateProgress() {
        var start = articleContent.getBoundingClientRect().top + window.scrollY;
        var distance = Math.max(1, articleContent.offsetHeight - window.innerHeight * .45);
        var ratio = Math.min(1, Math.max(0, (window.scrollY - start + window.innerHeight * .2) / distance));
        progressBar.style.transform = "scaleX(" + ratio + ")";
        ticking = false;
      }
      window.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateProgress);
      }, { passive: true });
      updateProgress();
    }
  }

  document.querySelectorAll(".entry-content table").forEach(function (table) {
    if (table.parentElement && (table.parentElement.classList.contains("table-scroll") || table.parentElement.classList.contains("adr-table-wrap") || table.parentElement.classList.contains("mn-table-wrap"))) return;
    var wrapper = document.createElement("div");
    wrapper.className = "table-scroll";
    wrapper.setAttribute("role", "region");
    wrapper.setAttribute("aria-label", "표를 좌우로 스크롤할 수 있습니다");
    wrapper.tabIndex = 0;
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}());
