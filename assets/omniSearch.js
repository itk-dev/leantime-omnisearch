import 'select2';
import 'select2/dist/css/select2.css';
import './omniSearch.css';
import FuzzySearch from 'fuzzy-search';

$(document).ready(function ($) {
  const cacheTimeouts = {
    projects: parseFloat(omniSearch.settings.projectCacheExpiration),
    tickets: parseFloat(omniSearch.settings.ticketCacheExpiration),
  };
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
          // Check if its december
          if (new Date().getMonth() === 11) {
            // Stolen from: https://pajasevi.github.io/CSSnowflakes/
            $('body').append(`
            <div class="snowflakes" aria-hidden="true">
                <div class="snowflake">
                    <div class="inner">❅</div>
                </div>
                <div class="snowflake">
                    <div class="inner">❅</div>
                </div>
                <div class="snowflake">
                    <div class="inner">❅</div>
                </div>
                <div class="snowflake">
                    <div class="inner">❅</div>
                </div>
                <div class="snowflake">
                    <div class="inner">❅</div>
                </div>
                <div class="snowflake">
                    <div class="inner">❅</div>
                </div>
                <div class="snowflake">
                    <div class="inner">❅</div>
                </div>
                <div class="snowflake">
                    <div class="inner">❅</div>
                </div>
                <div class="snowflake">
                    <div class="inner">❅</div>
                </div>
                <div class="snowflake">
                    <div class="inner">❅</div>
                </div>
                <div class="snowflake">
                    <div class="inner">❅</div>
                </div>
                <div class="snowflake">
                    <div class="inner">❅</div>
                </div>
            </div>`);
          }
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
          const action = e.params.data.action;
          const id = e.params.data.id;
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
              switch (action) {
                case 'goto':
                  const gotoTaskPath =
                    '?tab=ticketdetails#/tickets/showTicket/' + id;
                  window.location.href = gotoTaskPath;
                  destroyOmniSearch();
                  break;

                case 'logtime':
                  const logTimeTodoPath =
                    '?tab=timesheet#/tickets/showTicket/' + id;
                  window.location.href = logTimeTodoPath;
                  destroyOmniSearch();
                  break;
              }
              break;
            case 'projectAction':
              switch (action) {
                case 'goto':
                  const gotoProjectPath =
                    '/projects/changeCurrentProject/' + id;
                  window.location.href = gotoProjectPath;
                  destroyOmniSearch();
                  break;

                case 'createnew':
                  const createNewProjectPath =
                    '/projects/changeCurrentProject/' +
                    id +
                    '#/tickets/newTicket';
                  window.location.href = createNewProjectPath;
                  destroyOmniSearch();
                  break;
              }
              break;
          }
        });
      setOmnisearchData();
      omniSelectElement.on('select2:select', function (e) {
        var selection = e.params.data;
        const { text } = e.params.data;
        switch (selection.type) {
          case 'task':
            $(omniSelectElement)
              .next('.select2.select2-container')
              .attr('data-visible-selected', `Todos / ${text} /`);
            break;

          case 'project':
            $(omniSelectElement)
              .next('.select2.select2-container')
              .attr('data-visible-selected', `Projects / ${text} /`);
            break;
        }

        const elm = e.params.data.element;
        const $element = $(elm);
        const $this = $(this);
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
      case 'task':
        reinitOmniSearchWithData([
          {
            id: '',
            text: 'Actions',
            children: [
              {
                id: data.id,
                text: 'Open',
                type: 'taskAction' || 'projectAction',
                action: 'goto',
              },
              {
                id: data.id,
                text: 'Log Time',
                type: 'taskAction' || 'projectAction',
                action: 'logtime',
              },
            ],
          },
        ]);
        break;

      case 'project':
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

  // Almost entirely stolen from:
  // https://forums.select2.org/t/how-can-i-highlight-the-results-on-a-search/52/2
  function markMatch(text, term) {
    // Find where the match is
    const match = text?.toUpperCase().indexOf(term?.toUpperCase());

    let $result = $('<span></span>');
    // If there is no match, move on
    if (match < 0) {
      return $result.text(text);
    }

    // Put in whatever text is before the match
    $result.text(text.substring(0, match));

    // Mark the match
    let $match = $('<span class="select2-rendered__match"></span>');
    $match.text(text.substring(match, match + term.length));

    // Append the matching text
    $result.append($match);

    // Put in whatever is after the match
    $result.append(text.substring(match + term.length));

    return $result;
  }

  function isAction(data) {
    return (
      data.type?.toLowerCase() === 'taskaction' ||
      data.type?.toLowerCase() === 'projectaction'
    );
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
        templateResult: function (data) {
          const term = jQuery('.select2-search__field').val() || '';
          if (
            // This magic number decides how many characters a user has to type to see data. Now, 3.
            term.length >= 3 ||
            isAction(data)
          ) {
            // Tags to html, as they each need a separate span.
            let tagshtml = $('<span></span>');
            if (data.tags) {
              data.tags.split(',').forEach((tag) => {
                tagshtml.append(
                  `<span class="select2-tag">${markMatch(tag, term).html()}</span>`
                );
              });
            }

            const isTodoDoneStyling = data.isDone ? 'select2-is-done' : '';

            const $resultingHtml = data.projectName
              ? $(
                  `
                  <div class="select2-results__option-container ${isTodoDoneStyling}">
                    <div class="select2-flex-container">
                      <div class="select2-flex-container">
                        <div class="select2-todo">${markMatch(data.text, term).html()}</div>
                        <div>
                          <div class="select2-project-name">&nbsp;${markMatch(data.projectName, term).html()}</div>
                        </div>
                      </div>
                    </div>
                    <div>${tagshtml.html()}</div>
                  </div>
                  `
                )
              : $(`
                  <div class="select2-results__option-container">
                    <div class="select2-todo">${markMatch(data.text, term).html()}</div>
                  </div>
                  `);

            return $resultingHtml;
          }
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
        searchFieldInputLength === 0;
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
        let tickets = result.filter(
          (result) => result.type.toLowerCase() === 'task'
        );
        const ticketGroup = {
          id: 'task',
          text: 'Todos',
          children: [],
          index: 2,
        };

        let childrenForTicketGroup = [];
        tickets.forEach((ticket) => {
          let option = {
            // status 0 is done, I found out through this commit message
            // https://github.com/ITK-Leantime/leantime/commit/122a08ea0cc61c65aa57fd1d73f0948d46744055
            isDone: ticket.status === 0,
            id: ticket.id,
            text: ticket.headline,
            type: ticket.type,
            tags: ticket.tags,
            sprintName: ticket.sprintName,
            projectId: ticket.projectId,
            projectName: ticket.projectName,
          };
          childrenForTicketGroup.push(option);
        });

        // Sort, so the done tasks appear in the bottom of the search.
        const sortedByDone = [...childrenForTicketGroup].sort(
          (a, b) => Number(a.isDone) - Number(b.isDone)
        );
        ticketGroup.children = sortedByDone;
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

    // Convert ms to minutes
    let projectsLastUpdatedElement =
      '<span>Projects: ' +
      Math.round((Date.now() - projectLastUpdated) / 60000) +
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
    const term = params.term ? params.term.toLowerCase() : '';
    const searcher = new FuzzySearch(
      data.children,
      ['id', 'parentText', 'text', 'tags', 'projectName'],
      {
        caseSensitive: false,
      }
    );
    const result = searcher.search(term);

    return {
      ...data,
      children: result,
    };
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
    // Convert minutes to ms
    const cacheTimeoutMs = cacheTimeouts[item] * 60000;
    const cacheDataExpired = Date.now() - cacheDataExpiration > cacheTimeoutMs;

    return cacheDataExpired ? false : cacheData.data;
  }
});
