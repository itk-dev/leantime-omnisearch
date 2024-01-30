$(document).ready(function ($) {
  const userId = omniSearch.settings.userId;
  const elementIcons = {
    task: "fa fa-fw fa-tasks",
    project: "fa fa-fw fa-shapes",
  };

  // Append overlay
  $("body").append(`
      <div class="omni-search hidden">
          <select class="js-example-basic-multiple" name="actions[]"></select>
      </div>`);

  const omniSelectElement = $("body .omni-search > select");

  $("div.omni-search").on("click", function (e) {
    // Close overlay when clicking outside.
    if ($(e.target).hasClass("omni-search")) {
      destroyOmniSearch();
    }
  });

  $("div.content-container").on("click", function (e) {
    // Close overlay when clicking outside (when logging time).
    if ($(e.target).hasClass("content-container")) {
      destroyOmniSearch();
    }
  });

  // Event for init and destroy
  $("body").on("keydown", function (e) {
    const keyCode = e.keyCode;
    switch (keyCode) {
      case 27: // escape key.
        destroyOmniSearch();
        break;
      case 190: // dot key.
        if (!$("input, textarea").is(":focus")) {
          initOmniSearch();
        }
        break;
    }
  });

  // Init select2, get data, set events.
  function initOmniSearch() {
    $("body").addClass("prevent-scroll");
    omniSelectElement.addClass("loading");
    if ($(".omni-search").hasClass("hidden") === false) {
      return false;
    }

    $.fn.select2.amd.require(["select2/selection/search"], function (Search) {
      var oldRemoveChoice = Search.prototype.searchRemoveChoice;

      Search.prototype.searchRemoveChoice = function () {
        oldRemoveChoice.apply(this, arguments);
        this.$search.val("");
      };

      // Init select2
      omniSelectElement
        .select2({
          multiple: true,
        })
        .on("select2:select", function (e) {
          const data = e.params.data;
          $(".select2-search__field").val(data.text);
          switch (data.type) {
            case "project":
              $(".selected-value").text(data.text);
              reinitOmniSearchForType("project", data);
              break;
            case "task":
              $(".selected-value").text(data.text);
              reinitOmniSearchForType("task", data);
              break;
            case "taskAction":
              var ticketId = e.params.data.id;
              action = e.params.data.action;
              switch (action) {
                case "goto":
                  path = "?tab=ticketdetails#/tickets/showTicket/" + ticketId;
                  window.location.href = path;
                  destroyOmniSearch();
                  break;
                case "logtime":
                  path = "?tab=timesheet#/tickets/showTicket/" + ticketId;
                  window.location.href = path;
                  destroyOmniSearch();
                  break;
              }
              break;
            case "projectAction":
              var projectId = e.params.data.id;
              action = e.params.data.action;
              switch (action) {
                case "goto":
                  path = "/projects/changeCurrentProject/" + projectId;
                  window.location.href = path;
                  destroyOmniSearch();
                  break;
                case "createnew":
                  path =
                    "/projects/changeCurrentProject/" +
                    projectId +
                    "#/tickets/newTicket";
                  window.location.href = path;
                  destroyOmniSearch();
                  break;
              }
              break;
          }
        });
      getOmnisearchData();
      // Deactivates the sorting when selecting multiple options.
      omniSelectElement.on("select2:select", function (e) {
        var selection = e.params.data;
        switch (selection.type) {
          case "task":
            var selectedText = "To-Do's // " + e.params.data.text + " //";
            $(omniSelectElement)
              .next(".select2.select2-container")
              .attr("data-visible-selected", selectedText);
            break;
          case "project":
            var selectedText = "Projekter // " + e.params.data.text + " //";
            $(omniSelectElement)
              .next(".select2.select2-container")
              .attr("data-visible-selected", selectedText);
            break;
        }
        var testBox = document.querySelector(".select2.select2-container");
        var computedWidth = window.getComputedStyle(testBox, ":after").width;
        $(".select2-search__field").css("padding-left", computedWidth);
        var elm = e.params.data.element;
        $elm = $(elm);
        $t = $(this);
        $t.append($elm);
        $t.trigger("change.select2");
      });
      $(".omni-search").removeClass("hidden");
    });
  }

  // Close overlay.
  function destroyOmniSearch() {
    omniSelectElement.off();
    $("body").removeClass("prevent-scroll");
    omniSelectElement.empty().trigger("change");
    $("body .omni-search").addClass("hidden");
    $("body .select2-container").remove();
  }

  // Set up select content based on selected element.
  function reinitOmniSearchForType(type, data) {
    switch (type) {
      case "task": // ToDo.
        reinitOmniSearchWithData([
          {
            id: "",
            text: "action",
            children: [
              {
                id: data.id,
                text: "Go To",
                type: "taskAction",
                action: "goto",
              },
              {
                id: data.id,
                text: "Log Time",
                type: "taskAction",
                action: "logtime",
              },
            ],
          },
        ]);
        break;
      case "project": // Project.
        reinitOmniSearchWithData([
          {
            id: "",
            text: "action",
            children: [
              {
                id: data.id,
                text: "Go To",
                type: "projectAction",
                action: "goto",
              },
              {
                id: data.id,
                text: "Create new To-Do",
                type: "projectAction",
                action: "createnew",
              },
            ],
          },
        ]);
        break;
    }
  }

  // Set data and refresh select2.
  function reinitOmniSearchWithData(data) {
    omniSelectElement
      .select2("destroy")
      .empty()
      .select2({
        data: data,
        templateResult: function (data, container) {
          // Setup custom options with icon and data values.
          var $state = $(
            '<div class="select2-results__option-container">' +
              (data.type
                ? "<span class='" + elementIcons[data.type] + "'></span>"
                : "") +
              data.text +
              "</div>",
          );
          if (data.tags) {
            $(container).attr("data-tags", data.tags);
          }
          if (data.type) {
            $(container).attr("data-type", data.type);
          }
          if (data.client) {
            $(container).attr("data-client", data.client);
          }
          return $state;
        },
        matcher: matcher,
      })
      .trigger("change")
      .select2("open");

    // Listens for escape key to close omni-search overlay when select2 is in focus.
    $("body .select2-search__field").on("keydown", (e) => {
      var searchFieldInputLength = $("body .select2-search__field").val()
        .length;
      var hasSelection =
        $(".select2.select2-container").attr("data-visible-selected") &&
        $(".select2.select2-container").attr("data-visible-selected").length >
          0 &&
        searchFieldInputLength == 0;
      switch (e.keyCode) {
        case 8:
          if (hasSelection) {
            destroyOmniSearch();
            initOmniSearch();
          }

          break;
        case 27:
          destroyOmniSearch();
          break;
      }
    });
  }

  // Api
  function getAllProjects() {
    return callApi("leantime.rpc.projects.getAll", {});
  }

  function getUserTickets() {
    return callApi("leantime.rpc.tickets.getAll", {
      searchCriteria: {
        userId: userId,
      },
    });
  }

  function callApi(method, params) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: leantime.appUrl + "/api/jsonrpc/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          method: method,
          jsonrpc: "2.0",
          id: "1",
          params: params,
        }),
        success: resolve,
        error: reject,
      });
    });
  }

  // Get data for initial load.
  function getOmnisearchData() {
    var availableTags = [];

    let projects = getAllProjects().then((data) => {
      var projects = data.result;
      const projectGroup = {
        id: "project",
        text: "Projects",
        children: [],
        index: 1,
      };
      projects.forEach((project) => {
        let option = {
          id: project.id,
          text: project.name,
          type: "project",
          client: project.clientName,
        };
        projectGroup.children.push(option);
      });
      availableTags.push(projectGroup);
    });

    let tickets = getUserTickets().then((data) => {
      var result = data.result;
      let tickets = result.filter((result) => result.type === "task");
      const ticketGroup = {
        id: "task",
        text: "To-Do´s",
        children: [],
        index: 2,
      };
      tickets.forEach((ticket) => {
        let option = {
          id: ticket.id,
          text: ticket.headline,
          type: ticket.type,
          tags: ticket.tags,
          sprintName: ticket.sprintName,
          projectId: ticket.projectId,
          projectName: ticket.projectName,
        };
        ticketGroup.children.push(option);
      });
      availableTags.push(ticketGroup);
    });

    // Sort data by index and return to select2.
    projects.then(() => {
      tickets.then(() => {
        availableTags.sort(function (a, b) {
          return a.index - b.index;
        });
        reinitOmniSearchWithData(availableTags);
        omniSelectElement.removeClass("loading");
      });
    });
  }

  function fuzzySearch(needle, haystack) {
    needle = needle.toLowerCase();
    haystack = haystack.toLowerCase();

    if (needle === haystack) return true;
    if (needle.length > haystack.length) return false;

    let j = 0;
    for (let i = 0; i < needle.length; i++) {
      while (j < haystack.length && needle[i] !== haystack[j]) {
        j++;
      }
      if (j === haystack.length) return false;
      j++;
    }
    return true;
  }

  function matcher(params, data) {
    const original = [
      data.parentText,
      data.text,
      data.tags,
      data.sprintName,
      data.projectName,
      data.client,
    ]
      .join(" ")
      .toLowerCase();
    const term = params.term ? params.term.toLowerCase() : "";

    if (!term.trim() || fuzzySearch(term, original)) {
      return data;
    }

    if (data.children && data.children.length > 0) {
      const matchedChildren = data.children
        .map((child) => matcher(params, child))
        .filter(Boolean);
      if (matchedChildren.length > 0) {
        return { ...data, children: matchedChildren };
      }
    }

    return null;
  }
});
