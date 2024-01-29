$(document).ready(function ($) {
  const userId = omniSearch.settings.userId;
  const elementIcons = {
    task: "fa fa-fw fa-tasks",
    project: "fa fa-fw fa-shapes"
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

  function initOmniSearch() {
    $("body").addClass("prevent-scroll");
    omniSelectElement.addClass("loading");
    if ($(".omni-search").hasClass("hidden") === false) {
      return false;
    }
    localStorage.removeItem("availableTags");

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
              console.log(action);
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
              console.log(action);
              switch (action) {
                case "goto":
                  path = "/projects/changeCurrentProject/" + projectId;
                  window.location.href = path;
                  destroyOmniSearch();
                  break;
                case "createnew":
                  path = "/projects/changeCurrentProject/" + projectId + "#/tickets/newTicket";
                  window.location.href = path;
                  destroyOmniSearch();
                  break;
              }
              break;
            default:
              console.log("default case");
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

  function destroyOmniSearch() {
    omniSelectElement.off();
    $("body").removeClass("prevent-scroll");
    omniSelectElement.empty().trigger("change");
    $("body .omni-search").addClass("hidden");
    $("body .omni-search .content-container").empty();
    $("body .select2-container").remove();
  }
  function getAllProjects() {
    return callApi("leantime.rpc.projects.getAll", {});
  }
  function getUserTickets() {
    return callApi("leantime.rpc.tickets.getAll", {
      userId: userId,
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
  function reinitOmniSearchForType(type, data) {
    switch (type) {
      case "task":
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
      case "project":
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

  function reinitOmniSearchWithData(data) {
    omniSelectElement
      .select2("destroy")
      .empty()
      .select2({
        data: data,
        templateResult: function (data, container) {
          var $state = $(
            '<div class="select2-results__option-container">' +
              (data.type
                ? "<span class='" + elementIcons[data.type] + "'></span>"
                : "") +
              data.text +
              "</div>"
          );
          if (data.tags) {
            $(container).attr("data-tags", data.tags);
          }
          if (data.description) {
            $(container).attr("data-description", data.description);
          }
          if (data.type) {
            $(container).attr("data-type", data.type);
          }
          console.log(data);
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
        console.log(project);
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
          description: stripHTMLtags(ticket.description),
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
        availableTags.sort(function(a, b) {
            return a.index - b.index;
        });
        reinitOmniSearchWithData(availableTags);
        omniSelectElement.removeClass("loading");
      })
    })
  }
  function stripHTMLtags(html) {
    return html.replace(/<[^>]*>/g, "");
  }

  function matcher(params, data) {
    data.parentText = data.parentText || "";

    // Always return the object if there is nothing to compare
    if ($.trim(params.term) === "") {
      return data;
    }

    // Do a recursive check for options with children
    if (data.children && data.children.length > 0) {
      // Clone the data object if there are children
      // This is required as we modify the object to remove any non-matches
      var match = $.extend(true, {}, data);

      // Check each child of the option
      for (var c = data.children.length - 1; c >= 0; c--) {
        var child = data.children[c];
        child.parentText = data.parentText + " " + data.text;

        var matches = matcher(params, child);

        // If there wasn't a match, remove the object in the array
        if (matches == null) {
          match.children.splice(c, 1);
        }
      }

      // If any children matched, return the new object
      if (match.children.length > 0) {
        return match;
      }

      // If there were no matching children, check just the plain object
      return matcher(params, match);
    }

    // If the typed-in term matches the text of this term, or the text from any
    // parent term, then it's a match.
    var original = (
      data.parentText +
      " " +
      data.text +
      data.tags +
      data.description +
      data.sprintName +
      data.projectName +
      data.client
    ).toUpperCase();
    var term = params.term.toUpperCase();

    // Check if the text contains the term
    if (original.indexOf(term) > -1) {
      return data;
    }

    // If it doesn't contain the term, don't return anything
    return null;
  }
});
