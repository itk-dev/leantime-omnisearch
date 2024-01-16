/*
På task:
  Assign task til bruger
  (DONE) Tildel status til opgave
  Move task to project
  When a task is DONE - set remaining time to 0
*/

$(document).ready(function ($) {
    const userId = $('body input[name="userid"]').val();
    const elementIcons = {
      task: 'fa fa-fw fa-thumb-tack'
    }
    // Append overlay
    $("body").append(`
      <div class="omni-search hidden">
          <div class="loader-container"></div>
          <div class="content-container"></div>
          <select class="js-example-basic-multiple" name="actions[]"></select>
      </div>`);
    var omniSelectElement = $("body .omni-search > select");
    var loaderContainer = $("body .omni-search > .loader-container");
    var contentContainer = $("body .omni-search > .content-container");
    $("body").on("keydown", function (e) {
      const keyCode = e.keyCode;
      switch (keyCode) {
        case 27:
          destroyOmniSearch();
          break;
        case 190:
          initOmniSearch();
          break;
      }
    });

    function initOmniSearch() {
      $('body').addClass('prevent-scroll');
      if ($(".omni-search").hasClass("hidden") === false) {
        return false;
      }
      localStorage.removeItem("availableTags");
      $(".omni-search").removeClass("hidden");
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
            $('.select2-search__field').val(data.text);
            switch (data.type) {
              case "link":
                const path = e.params.data.value;
                window.location.href = path;
                initLoaderState("loading");
                break;
              case "task":
                $('.selected-value').text(data.text);
                reinitOmniSearchForType("task", data);
                break;
              case "action":
                var ticketId = e.params.data.id;
                const action = e.params.data.action;
                switch (action) {
                  case "logtime":
                    initViewSpecificContent("logtime", ticketId);
                    break;
                  case "status":
                    const status = e.params.data.value;
                    initLoaderState("loading");
                    updateTicket(ticketId, { status: status }).then((data) => {
                      const success = data.result[0];
                      if (success) {
                        initLoaderState("success");
                      } else {
                        initLoaderState("error");
                      }
                    });
                    break;
                  case "assign":
                    const editorId = e.params.data.value;
                    initLoaderState("loading");
                    updateTicket(data.id, { editorId: editorId }).then((data) => {
                      const success = data.result[0];
                      if (success) {
                        initLoaderState("success");
                      } else {
                        initLoaderState("error");
                      }
                    });
                    break;
                  case "punchin":
                    punchInOnTicket(ticketId);
                    break;
                  case "delete":
                    initLoaderState("loading");
                    deleteTicketById(ticketId).then((data) => {
                      const success = data.result[0];
                      if (success) {
                        initLoaderState("success");
                      } else {
                        initLoaderState("error");
                      }
                    });
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
          switch(selection.type)
          {
            case "task":
              var selectedText = "To-Do's // " + e.params.data.text + " //";
              $(omniSelectElement).next('.select2.select2-container').attr('data-visible-selected', selectedText);
            break;
          }
          var testBox = document.querySelector('.select2.select2-container');
          var computedWidth = window.getComputedStyle(testBox, ':after').width;
          $(".select2-search__field").css('padding-left', computedWidth);
          var elm = e.params.data.element;
          $elm = $(elm);
          $t = $(this);
          $t.append($elm);
          $t.trigger("change.select2");
        });
      });
    }

    function destroyOmniSearch() {
      omniSelectElement.off();
      $('body').removeClass('prevent-scroll');
      omniSelectElement.empty().trigger("change");
      $("body .omni-search").addClass("hidden");
      $("body .omni-search .content-container").empty();
      $("body .select2-container").remove();
    }

    function initViewSpecificContent(state, data) {
      switch (state) {
        case "logtime":
          contentContainer.html(
            '<div class="log-time-container"><input name="date" type="date" value="' +
              formatDateSelect(new Date()) +
              '" /><input name="hours" type="number" placeholder="Timer" /><textarea id="timelogTextarea" height="150" name="description" type"text" placeholder="Beskrivelse"></textarea><button id="timelogSubmit">Log tid</button></div>'
          );
          $('.log-time-container > input[name="hours"]').focus();
          $('.log-time-container > input[name="hours"]').on("keydown", (e) => {
            if (e.keyCode == 13) {
              $(".log-time-container > button").trigger("click");
            }
          });
          $(".log-time-container > button").on("click", () => {
            const id = data;
            const date = $('.log-time-container > input[name="date"]').val();
            const hours = $('.log-time-container > input[name="hours"]').val();
            const description = $('.log-time-container > textarea#timelogTextarea').val();
            contentContainer.html("");
            initLoaderState("loading");
            logTimeOnTicket(id, date, hours, description).then((data) => {
              const success = data.result[0];
              if (success) {
                initLoaderState("success");
              } else {
                initLoaderState("error");
              }
            });
          });
          break;
      }
    }
    function initLoaderState(state) {
      switch (state) {
        case "loading":
          loaderContainer.html('<span class="loader">LOADING</span>');
          break;
        case "success":
          loaderContainer.html('<span class="loader">SUCCESS!</span>');
          omniSelectElement.select2("close");
          setTimeout(() => {
            loaderContainer.html("");
            getOmnisearchData();
          }, 1500);
          break;
        case "error":
          loaderContainer.html('<span class="loader">ERROR</span>');
          break;
      }
    }
    function getUsersAssignedToProject(projectId) {
      return callApi("leantime.rpc.projects.getUsersAssignedToProject", {
        projectId: projectId,
      });
    }
    function updateTicket(id, data) {
      return callApi("leantime.rpc.tickets.patch", {
        id: id,
        params: {
          ...data,
        },
      });
    }
    function punchInOnTicket(id) {
      return callApi("leantime.rpc.timesheets.punchIn", {
        ticketId: id,
      });
    }
    function logTimeOnTicket(id, date, hours, description) {
      let dateObj = formatDateApi(new Date(date));
      return callApi("leantime.rpc.timesheets.logTime", {
        ticketId: id,
        params: {
          hours: hours,
          userId: userId,
          date: dateObj,
          description: description,
          kind: "DEVELOPMENT", //@TODO find out if kind should be used.
        },
      });
    }
    function deleteTicketById(id) {
      return callApi("leantime.rpc.tickets.delete", {
        id: id,
      });
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
            "x-api-key":
              "lt_DnmcuAw5WGHJty2zq6pIlYH7JYzf6OpG_dgXXCQ5qpVednfS5PzmKUYnx4FQau2Va",
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
          const projectId = data.projectId;
          getUsersAssignedToProject(projectId).then((data) => {
            const users = data.result.map((user) => {
              return {
                id: data.id,
                text: user.firstname + " " + user.lastname,
                type: "action",
                action: "assign",
                value: user.id,
              };
            });
          });
          reinitOmniSearchWithData([
            // { id: data.id, text: "Delete", type: "action", action: "delete" },
            {
              id: '',
              text: 'action',
              children: [
                { id: data.id, text: "Log Time", type: "action", action: "logtime" },
              ]
            },
            // { id: data.id, text: "Punchin", type: "action", action: "punchin" },
            {
              id: '',
              text: "status",
              children: [
                {
                  id: data.id,
                  text: "Done",
                  type: "action",
                  action: "status",
                  value: "0",
                },
                {
                  id: data.id,
                  text: "In Progress",
                  type: "action",
                  action: "status",
                  value: "4",
                },
                {
                  id: data.id,
                  text: "Waiting for Approval",
                  type: "action",
                  action: "status",
                  value: "2",
                },
                {
                  id: data.id,
                  text: "Blocked",
                  type: "action",
                  action: "status",
                  value: "1",
                },
                {
                  id: data.id,
                  text: "Archived",
                  type: "action",
                  action: "status",
                  value: "-1",
                },
                {
                  id: data.id,
                  text: "New",
                  type: "action",
                  action: "status",
                  value: "3",
                },
              ]

            }
            // ...users
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
                (data.type ? "<span class='"+elementIcons[data.type]+"'></span>":"") +
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
            return $state;
          },
          matcher: matcher
        })
        .trigger("change")
        .select2("open");


      // Listens for escape key to close omni-search overlay when select2 is in focus.
      $("body .select2-search__field").on("keydown", (e) => {
        var searchFieldInputLength = $("body .select2-search__field").val().length;
        var hasSelection = $('.select2.select2-container').attr('data-visible-selected') && $('.select2.select2-container').attr('data-visible-selected').length > 0 && searchFieldInputLength == 0;
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
        var availableTags = [
          // {
          //   id: "Home",
          //   text: "Home",
          //   type: "link",
          //   value: "/dashboard/home",
          // },
          // {
          //   id: "My Projects",
          //   text: "My Projects",
          //   type: "link",
          //   value: "/projects/showMy",
          // },
        ];
        getUserTickets().then((data) => {
          const tickets = data.result;
          const ticketGroup = {
            id: 'task',
            text: 'To-Do´s',
            children: [],
          }
          tickets.forEach((ticket) => {
            let tag = {
              id: ticket.id,
              text: ticket.headline,
              type: ticket.type,
              tags: ticket.tags,
              description: stripHTMLtags(ticket.description),
              sprintName: ticket.sprintName,
              projectId: ticket.projectId,
              projectName: ticket.projectName,
            };
            ticketGroup.children.push(tag);

          });
          availableTags.push(ticketGroup);
        reinitOmniSearchWithData(availableTags);
        })


    }
    function formatDateApi(dateObj) {
      // For api calls
      //api compatible date format
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");

      return `${month}/${day}/${year}`;
    }
    function formatDateSelect(dateObj) {
      // For input type date
      //api compatible date format
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Add 1 to the month because it is zero-based
      const day = String(dateObj.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }
    function stripHTMLtags(html) {
      return html.replace(/<[^>]*>/g, "");
    }
    // function aggregateProjectInfo() {
    //   console.log("method called");
    //   return new Promise((resolve, reject) => {
    //     let leantimeObject = {};
    //   callApi("leantime.rpc.projects.getAll", {}).then((data) => {
    //     // Get all projects
    //     const projects = data.result;
    //     projects.forEach((project) => {
    //       callApi("leantime.rpc.projects.getUsersAssignedToProject", {
    //         projectId: project.id,
    //       }).then((data) => {
    //         // Get all assigned users
    //         const team = data.result;
    //         project.team = team;
    //         callApi("leantime.rpc.tickets.getAll", { searchCriteria: {} }).then(
    //           (data) => {
    //             // Get all tickets
    //             const tickets = data.result;
    //             leantimeObject.structure = projects.map((project) => {
    //               return {
    //                 ...project,
    //                 tickets: tickets.filter((ticket) => {
    //                   if (project.id === ticket.projectId) {
    //                     return ticket;
    //                   }
    //                 }),
    //               };
    //             });
    //             leantimeObject.tickets = tickets;
    //             leantimeObject.team = team;
    //             localStorage.setItem("leantimeObject", JSON.stringify(leantimeObject));
    //             console.log("finished");
    //             resolve(leantimeObject);
    //           }
    //         );
    //       });
    //     });
    //   });
    // });
    // }
    function matcher (params, data) {
      console.log(data);
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
      var original = (data.parentText + ' ' + data.text + data.tags + data.description + data.sprintName + data.projectName).toUpperCase();
      var term = params.term.toUpperCase();


      // Check if the text contains the term
      if (original.indexOf(term) > -1) {
        return data;
      }

      // If it doesn't contain the term, don't return anything
      return null;
    }

  });

