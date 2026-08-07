(function () {
  "use strict";

  var body = document.body;
  var header = document.querySelector("[data-header]");
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  var searchPanel = document.querySelector("[data-search-panel]");
  var searchDialog = searchPanel && searchPanel.querySelector("[role='dialog']");
  var searchOpeners = document.querySelectorAll("[data-search-open]");
  var searchClosers = document.querySelectorAll("[data-search-close]");
  var lastFocusedElement = null;
  var searchBackgroundState = [];

  function normalizePath(link) {
    var url;
    try { url = new URL(link.href, window.location.href); } catch (error) { return link.href; }
    return url.origin + url.pathname.replace(/\/$/, "");
  }

  var currentPath = normalizePath({ href: window.location.href });

  document.querySelectorAll(".top-nav, .mobile-menu").forEach(function (nav) {
    var seen = {};
    nav.querySelectorAll("a").forEach(function (link) {
      var key = normalizePath(link);
      if (seen[key]) {
        link.remove();
        return;
      }
      seen[key] = true;
      if (key === currentPath) link.setAttribute("aria-current", "page");
    });
  });

  function updateMenuState(isOpen) {
    var label;
    if (!menuButton) return;
    menuButton.setAttribute("aria-expanded", String(isOpen));
    label = menuButton.querySelector(".sr-only");
    if (label) label.textContent = isOpen ? "메뉴 닫기" : "메뉴 열기";
  }

  function closeMenu(restoreFocus) {
    if (!menuButton || !mobileMenu) return;
    var wasOpen = !mobileMenu.hidden;
    mobileMenu.hidden = true;
    updateMenuState(false);
    body.classList.remove("menu-open");
    if (restoreFocus && wasOpen) menuButton.focus();
  }

  function toggleMenu() {
    if (!menuButton || !mobileMenu) return;
    var nextOpen = mobileMenu.hidden;
    mobileMenu.hidden = !nextOpen;
    updateMenuState(nextOpen);
    body.classList.toggle("menu-open", nextOpen);
  }

  function setSearchBackgroundInert(isInert) {
    var parent;
    if (!searchPanel) return;

    if (isInert) {
      parent = searchPanel.parentElement;
      if (!parent) return;
      searchBackgroundState = [];
      Array.prototype.forEach.call(parent.children, function (element) {
        if (element === searchPanel) return;
        searchBackgroundState.push({
          element: element,
          inert: element.inert,
          ariaHidden: element.getAttribute("aria-hidden")
        });
        element.inert = true;
        element.setAttribute("aria-hidden", "true");
      });
      return;
    }

    searchBackgroundState.forEach(function (state) {
      state.element.inert = state.inert;
      if (state.ariaHidden === null) state.element.removeAttribute("aria-hidden");
      else state.element.setAttribute("aria-hidden", state.ariaHidden);
    });
    searchBackgroundState = [];
  }

  function setSearchExpanded(isOpen) {
    searchOpeners.forEach(function (button) {
      button.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function openSearch() {
    var input;
    if (!searchPanel) return;
    lastFocusedElement = document.activeElement;
    closeMenu();
    searchPanel.hidden = false;
    setSearchExpanded(true);
    body.classList.add("search-open");
    input = searchPanel.querySelector("input[type='search']");
    if (input) input.focus();
    else if (searchDialog) searchDialog.focus();
    setSearchBackgroundInert(true);
  }

  function closeSearch() {
    if (!searchPanel || searchPanel.hidden) return;
    searchPanel.hidden = true;
    setSearchExpanded(false);
    setSearchBackgroundInert(false);
    body.classList.remove("search-open");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
    lastFocusedElement = null;
  }

  if (menuButton) menuButton.addEventListener("click", toggleMenu);
  searchOpeners.forEach(function (button) { button.addEventListener("click", openSearch); });
  searchClosers.forEach(function (button) { button.addEventListener("click", closeSearch); });

  document.addEventListener("keydown", function (event) {
    var focusable;
    var first;
    var last;

    if (event.key === "Tab" && searchPanel && !searchPanel.hidden) {
      focusable = Array.prototype.filter.call(searchPanel.querySelectorAll("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])"), function (element) {
        return element.offsetParent !== null;
      });
      if (focusable.length) {
        first = focusable[0];
        last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    if (event.key === "Escape") {
      var searchWasOpen = searchPanel && !searchPanel.hidden;
      closeSearch();
      if (!searchWasOpen) closeMenu(true);
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
    if (button.copyResultTimer) window.clearTimeout(button.copyResultTimer);
    button.setAttribute("data-original-label", original);
    button.textContent = message;
    button.classList.toggle("is-copy-error", message === "복사 실패");
    button.copyResultTimer = window.setTimeout(function () {
      button.textContent = original;
      button.classList.remove("is-copy-error");
      button.copyResultTimer = null;
    }, 4000);
  }

  function legacyCopy(text) {
    var input = document.createElement("textarea");
    var copied = false;
    var previouslyFocused = document.activeElement;
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
    if (previouslyFocused && typeof previouslyFocused.focus === "function") previouslyFocused.focus();
    return copied;
  }

  function copyPageLink(button) {
    var url = window.location.href.split("#")[0];

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(function () {
        showCopyResult(button, "복사 완료");
      }).catch(function () {
        showCopyResult(button, legacyCopy(url) ? "복사 완료" : "복사 실패");
      });
      return;
    }

    showCopyResult(button, legacyCopy(url) ? "복사 완료" : "복사 실패");
  }

  document.querySelectorAll("[data-copy-link]").forEach(function (button) {
    button.addEventListener("click", function () { copyPageLink(button); });
  });

  var articleContent = document.querySelector("[data-entry-content]");
  var progress = document.querySelector("[data-reading-progress]");
  var progressBar = progress && progress.querySelector("span");

  function createUniqueId(base) {
    var candidate = base;
    var suffix = 2;
    while (document.getElementById(candidate)) {
      candidate = base + "-" + suffix;
      suffix += 1;
    }
    return candidate;
  }

  if (articleContent) {
    var plainText = (articleContent.textContent || "").replace(/\s+/g, " ").trim();
    var readingTime = Math.max(1, Math.ceil(plainText.length / 500));
    var readingTimeTarget = document.querySelector("[data-reading-time]");
    if (readingTimeTarget) {
      readingTimeTarget.textContent = "약 " + readingTime + "분";
      readingTimeTarget.hidden = false;
    }

    var toc = document.querySelector("[data-toc]");
    var tocList = document.querySelector("[data-toc-list]");
    var headings = articleContent.querySelectorAll("h2, h3");
    var tocLinks = [];

    if (toc && tocList && headings.length >= 2) {
      var introAnchor = document.createElement("span");
      var introLink = document.createElement("a");
      introAnchor.id = createUniqueId("report-summary");
      introAnchor.className = "toc-anchor";
      introAnchor.setAttribute("aria-hidden", "true");
      articleContent.insertBefore(introAnchor, articleContent.firstChild);

      introLink.href = "#" + introAnchor.id;
      introLink.textContent = "리포트 요약";
      introLink.setAttribute("data-level", "2");
      tocList.appendChild(introLink);
      tocLinks.push(introLink);

      headings.forEach(function (heading, index) {
        if (!heading.id || document.getElementById(heading.id) !== heading) {
          heading.id = createUniqueId("report-section-" + (index + 1));
        }
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

      function scheduleProgressUpdate() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateProgress);
      }

      window.addEventListener("scroll", scheduleProgressUpdate, { passive: true });
      window.addEventListener("resize", scheduleProgressUpdate, { passive: true });
      if ("ResizeObserver" in window) {
        var progressResizeObserver = new ResizeObserver(scheduleProgressUpdate);
        progressResizeObserver.observe(articleContent);
      }
      updateProgress();
    }
  }

  var tableScrollers = [];
  var tableScrollerContents = [];

  function setManagedAttribute(wrapper, name, value) {
    var marker = "data-managed-" + name;
    if (wrapper.hasAttribute(name)) return;
    wrapper.setAttribute(name, value);
    wrapper.setAttribute(marker, "true");
  }

  function removeManagedAttribute(wrapper, name) {
    var marker = "data-managed-" + name;
    if (wrapper.getAttribute(marker) !== "true") return;
    wrapper.removeAttribute(name);
    wrapper.removeAttribute(marker);
  }

  function updateTableScroller(wrapper) {
    var scrollable = wrapper.scrollWidth > wrapper.clientWidth + 1;
    if (scrollable) {
      setManagedAttribute(wrapper, "role", "region");
      setManagedAttribute(wrapper, "aria-label", "표를 좌우로 스크롤할 수 있습니다");
      setManagedAttribute(wrapper, "tabindex", "0");
      return;
    }
    removeManagedAttribute(wrapper, "role");
    removeManagedAttribute(wrapper, "aria-label");
    removeManagedAttribute(wrapper, "tabindex");
  }

  function registerTableScroller(wrapper, table) {
    if (tableScrollerContents.indexOf(table) === -1) tableScrollerContents.push(table);
    if (tableScrollers.indexOf(wrapper) === -1) {
      tableScrollers.push(wrapper);
      updateTableScroller(wrapper);
    }
  }

  document.querySelectorAll(".entry-content table").forEach(function (table) {
    var existingWrapper = table.closest(".table-scroll, .content-table-wrap, .adr-table-wrap, .mn-table-wrap, .vscode-table-scroll");
    if (existingWrapper) {
      registerTableScroller(existingWrapper, table);
      return;
    }
    var wrapper = document.createElement("div");
    wrapper.className = "table-scroll";
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
    registerTableScroller(wrapper, table);
  });

  if (tableScrollers.length) {
    var tableResizeTicking = false;
    function updateTableScrollers() {
      tableScrollers.forEach(updateTableScroller);
      tableResizeTicking = false;
    }
    function scheduleTableScrollerUpdate() {
      if (tableResizeTicking) return;
      tableResizeTicking = true;
      window.requestAnimationFrame(updateTableScrollers);
    }
    window.addEventListener("resize", scheduleTableScrollerUpdate, { passive: true });
    if ("ResizeObserver" in window) {
      var tableResizeObserver = new ResizeObserver(scheduleTableScrollerUpdate);
      tableScrollers.forEach(function (wrapper) { tableResizeObserver.observe(wrapper); });
      tableScrollerContents.forEach(function (table) { tableResizeObserver.observe(table); });
    }
    tableScrollerContents.forEach(function (table) {
      table.querySelectorAll("img").forEach(function (image) {
        if (!image.complete) image.addEventListener("load", scheduleTableScrollerUpdate, { once: true });
      });
    });
  }
}());
