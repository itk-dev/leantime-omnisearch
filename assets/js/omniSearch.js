$(document).ready(function ($) {
  const cacheTimeouts = {
    projects: parseFloat(omniSearch.settings.projectCacheExpiration),
    tickets: parseFloat(omniSearch.settings.ticketCacheExpiration),
  };
  const userId = omniSearch.settings.userId;
  const key = {
    escape: 27,
    period: 190,
    backspace: 8,
  };
  let isFetching = false; // Is data being fetched
  let isVisible = false; // Is overlay visible

  // Fetch new data if cache is stale
  fetchOmnisearchData();

  // Append overlay
  $('body').append(`
      <div class="omni-search hidden">
          <select class="js-example-basic-multiple" name="actions[]"></select>
          <div class="omni-search-panel"></div>
      </div>`);

  const omniSelectElement = $('body .omni-search > select');
  const omniSelectPanelElement = $('body .omni-search > .omni-search-panel');
  $('div.omni-search').on('click', function (e) {
    // Close overlay when clicking outside.
    if ($(e.target).hasClass('omni-search')) {
      destroyOmniSearch();
    }
  });

  $('div.content-container').on('click', function (e) {
    // Close overlay when clicking outside (when logging time).
    if ($(e.target).hasClass('content-container')) {
      destroyOmniSearch();
    }
  });

  // Event for init and destroy
  $('body').on('keydown', function (e) {
    const keyCode = e.keyCode;
    switch (keyCode) {
      case key.escape:
        destroyOmniSearch();
        break;

      case key.period:
        if (!$('input, textarea').is(':focus')) {
          initOmniSearch();
        }
        break;
    }
  });

  // Init select2, get data, set events.
  function initOmniSearch() {
    isFetching = false;
    isVisible = true;
    $('body').addClass('prevent-scroll');
    if ($('.omni-search').hasClass('hidden') === false) {
      return false;
    }

    $.fn.select2.amd.require(['select2/selection/search'], function (Search) {
      var oldRemoveChoice = Search.prototype.searchRemoveChoice;

      Search.prototype.searchRemoveChoice = function () {
        oldRemoveChoice.apply(this, arguments);
        this.$search.val('');
      };

      // Init select2
      omniSelectElement
        .select2({
          multiple: true,
        })
        .on('select2:select', function (e) {
          const data = e.params.data;
          $('.select2-search__field').val(data.text);
          switch (data.type) {
            case 'project':
              $('.selected-value').text(data.text);
              reinitOmniSearchForType('project', data);
              break;

            case 'task':
              $('.selected-value').text(data.text);
              reinitOmniSearchForType('task', data);
              break;

            case 'taskAction':
              var ticketId = e.params.data.id;
              action = e.params.data.action;
              switch (action) {
                case 'goto':
                  path = '?tab=ticketdetails#/tickets/showTicket/' + ticketId;
                  window.location.href = path;
                  destroyOmniSearch();
                  break;

                case 'logtime':
                  path = '?tab=timesheet#/tickets/showTicket/' + ticketId;
                  window.location.href = path;
                  destroyOmniSearch();
                  break;
              }
              break;

            case 'projectAction':
              var projectId = e.params.data.id;
              action = e.params.data.action;
              switch (action) {
                case 'goto':
                  path = '/projects/changeCurrentProject/' + projectId;
                  window.location.href = path;
                  destroyOmniSearch();
                  break;

                case 'createnew':
                  path =
                    '/projects/changeCurrentProject/' +
                    projectId +
                    '#/tickets/newTicket';
                  window.location.href = path;
                  destroyOmniSearch();
                  break;
              }
              break;
          }
        });
      setOmnisearchData();
      omniSelectElement.on('select2:select', function (e) {
        var selection = e.params.data;
        switch (selection.type) {
          case 'task':
            var selectedText = "To-Do's // " + e.params.data.text + ' //';
            $(omniSelectElement)
              .next('.select2.select2-container')
              .attr('data-visible-selected', selectedText);
            break;

          case 'project':
            var selectedText = 'Projects // ' + e.params.data.text + ' //';
            $(omniSelectElement)
              .next('.select2.select2-container')
              .attr('data-visible-selected', selectedText);
            break;
        }
        /*
      Inserts the selected value into the searchfield
         and adds left padding to the input field
        */
        var searchBox = document.querySelector('.select2.select2-container');
        var computedWidth = window.getComputedStyle(searchBox, ':after').width;
        $('.select2-search__field').css('padding-left', computedWidth);
        var elm = e.params.data.element;
        $element = $(elm);
        $this = $(this);
        $this.append($element);
        $this.trigger('change.select2');
      });
      $('.omni-search').removeClass('hidden');
    });
  }

  // Close overlay.
  function destroyOmniSearch() {
    omniSelectElement.off();
    $('body').removeClass('prevent-scroll');
    omniSelectElement.empty().trigger('change');
    $('body .omni-search').addClass('hidden');
    $('body .select2-container').remove();
    omniSelectPanelElement.empty();
    isVisible = false;
  }

  // Set up select content based on selected element.
  function reinitOmniSearchForType(type, data) {
    switch (type) {
      case 'task': // ToDo.
        reinitOmniSearchWithData([
          {
            id: '',
            text: 'Actions',
            children: [
              {
                id: data.id,
                text: 'Open',
                type: 'taskAction',
                action: 'goto',
              },
              {
                id: data.id,
                text: 'Log Time',
                type: 'taskAction',
                action: 'logtime',
              },
            ],
          },
        ]);
        break;

      case 'project': // Project.
        reinitOmniSearchWithData([
          {
            id: '',
            text: 'Actions',
            children: [
              {
                id: data.id,
                text: 'Go to',
                type: 'projectAction',
                action: 'goto',
              },
              {
                id: data.id,
                text: 'Create To-Do',
                type: 'projectAction',
                action: 'createnew',
              },
            ],
          },
        ]);
        break;
    }
  }

  // Set data and refresh select2.
  function reinitOmniSearchWithData(data) {
    if (!isVisible || data.length === 0) {
      return false;
    }
    omniSelectElement
      .select2('destroy')
      .empty()
      .select2({
        data: data,
        templateResult: function (data, container) {
          // Setup custom options with icon and data values.
          var $state = $(
            '<div class="select2-results__option-container">' +
              data.text +
              '</div>'
          );
          if (data.tags) {
            $(container).attr('data-tags', data.tags);
          }
          if (data.type) {
            $(container).attr('data-type', data.type);
          }
          if (data.client) {
            $(container).attr('data-client', data.client);
          }
          return $state;
        },
        matcher: matcher,
      })
      .trigger('change')
      .select2('open');

    // Listens for escape key to close omni-search overlay when select2 is in focus.
    $('body .select2-search__field').on('keydown', (e) => {
      var searchFieldInputLength = $('body .select2-search__field').val()
        .length;
      var hasSelection =
        $('.select2.select2-container').attr('data-visible-selected') &&
        $('.select2.select2-container').attr('data-visible-selected').length >
          0 &&
        searchFieldInputLength == 0;
      switch (e.keyCode) {
        case key.backspace:
          if (hasSelection) {
            destroyOmniSearch();
            initOmniSearch();
          }
          break;

        case key.escape:
          destroyOmniSearch();
          break;
      }
    });
  }

  // Api
  function getAllProjects() {
    return callApi('leantime.rpc.projects.getAll', {});
  }

  function getAllTickets() {
    return callApi('leantime.rpc.tickets.getAll', {});
  }

  function callApi(method, params) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: leantime.appUrl + '/api/jsonrpc/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          method: method,
          jsonrpc: '2.0',
          id: '1',
          params: params,
        }),
        success: resolve,
        error: reject,
      });
    });
  }

  async function fetchOmnisearchData() {
    let projectPromise;
    let ticketPromise;
    let projectCacheData = getCacheData('projects');
    isFetching = true;

    if (projectCacheData) {
      projectPromise = Promise.resolve(projectCacheData);
    } else {
      projectPromise = getAllProjects().then((data) => {
        var projects = data.result;
        const projectGroup = {
          id: 'project',
          text: 'Projects',
          children: [],
          index: 1,
        };
        projects.forEach((project) => {
          let option = {
            id: project.id,
            text: project.name,
            type: 'project',
            client: project.clientName,
          };
          projectGroup.children.push(option);
        });
        writeToCache('projects', {
          data: projectGroup,
          expiration: Date.now(),
        });
        return projectGroup;
      });
    }

    let ticketCacheData = getCacheData('tickets');
    if (ticketCacheData) {
      ticketPromise = Promise.resolve(ticketCacheData);
    } else {
      ticketPromise = getAllTickets().then((data) => {
        var result = data.result;
        let tickets = result.filter((result) => result.type === 'task');
        const ticketGroup = {
          id: 'task',
          text: 'To-Do´s',
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
        writeToCache('tickets', {
          data: ticketGroup,
          expiration: Date.now(),
        });
        return ticketGroup;
      });
    }

    const promises = [projectPromise, ticketPromise];
    const results = await Promise.allSettled(promises);
    const data = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value)
      .sort(function (a, b) {
        // Sort by index.
        return a.index - b.index;
      });

    return data;
  }

  function setOmnisearchData() {
    omniSelectElement.addClass('loading');
    if (isFetching) {
      setTimeout(() => {
        // If already fetching, recall for cached result.
        setOmnisearchData();
      }, 500);
    } else {
      fetchOmnisearchData().then((availableTags) => {
        isFetching = false;
        reinitOmniSearchWithData(availableTags);
        omniSelectElement.removeClass('loading');
        populateLastUpdated();
      });
    }
  }

  function populateLastUpdated() {
    let projectLastUpdated = readFromCache('projects').expiration;
    let ticketsLastUpdated = readFromCache('tickets').expiration;

    let projectsLastUpdatedElement =
      '<span>Projects: ' +
      Math.round((Date.now() - projectLastUpdated) / 60000) + // Convert ms to minutes
      ' min ago.</span>';
    let ticketsLastUpdatedElement =
      '<span>Tickets: ' +
      Math.round((Date.now() - ticketsLastUpdated) / 60000) +
      ' min ago.</span>';
    omniSelectPanelElement.html(
      '<div><button id="refreshBtn"><span><i class="fa-solid fa-arrows-rotate"></i>Sync data</span></button></div><div>' +
        projectsLastUpdatedElement +
        ticketsLastUpdatedElement +
        '</div>'
    );

    $('#refreshBtn').on('click', function (e) {
      if (isFetching) {
        return false;
      }
      $(this)
        .children('span')
        .html('<i class="fa-solid fa-arrows-rotate fa-spin"></i>Syncing data');
      refreshOmniSearch();
    });
  }

  function refreshOmniSearch() {
    removeFromCache('projects');
    removeFromCache('tickets');
    setOmnisearchData();
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
      .join(' ')
      .toLowerCase();
    const term = params.term ? params.term.toLowerCase() : '';

    if (!term.trim() || fuzzySearch(term, original)) {
      return data;
    }

    if (data.children && data.children.length > 0) {
      const matchedChildren = data.children
        .map((child) => matcher(params, child))
        .filter(Boolean);
      if (matchedChildren.length > 0) {
        return {
          ...data,
          children: matchedChildren,
        };
      }
    }

    return null;
  }

  function removeFromCache(item) {
    localStorage.removeItem(item);
  }

  function writeToCache(item, data) {
    localStorage.setItem(item, JSON.stringify(data));
  }

  function readFromCache(item) {
    return JSON.parse(localStorage.getItem(item)) || null;
  }

  function getCacheData(item) {
    const cacheData = readFromCache(item);

    if (!cacheData) {
      return false;
    }

    const cacheDataExpiration = cacheData.expiration ?? 0;
    const cacheTimeoutMs = cacheTimeouts[item] * 60000; // Convert minutes to ms
    const cacheDataExpired = Date.now() - cacheDataExpiration > cacheTimeoutMs;

    return cacheDataExpired ? false : cacheData.data;
  }
});
