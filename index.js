// Import stylesheets
import './style.css';
import { pdp } from './pdp.js';
import { home } from './home.js';

import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import 'instantsearch.css/themes/satellite.css';

import {
  configure,
  hits,
  pagination,
  panel,
  refinementList,
  searchBox,
  poweredBy,
  clearRefinements,
  currentRefinements,
} from 'instantsearch.js/es/widgets';

const searchClient = algoliasearch(
  'YSMG3EWZL9',
  'f6c407cdd05ff53d3de47152fdb17ab3'
);

const search = instantsearch({
  indexName: 'Sending Events',
  searchClient,
  routing: true,
  insights: false,
});

const routes = {
  '/': home,
  '/pdp': pdp,
};

const appDiv = document.getElementById('app');
const renderContent = (route) => {
  search.addWidgets([
    poweredBy({
      container: '#nav',
    }),
  ]);
  if (route == '/') {
    appDiv.innerHTML = routes[route].content;
    search.addWidgets([
      searchBox({
        container: '#searchbox',
      }),
      hits({
        container: '#hits',
        templates: {
          item: (hit, { html, components }) => html`
          <article>
            <h2>${components.Highlight({
              hit,
              attribute: 'name',
            })}</h2>
            <p>${components.Highlight({ hit, attribute: 'description' })}</p>
            <a href="/${hit.objectID}?queryID=${
            hit.__queryID
          }" class="button">More details</a>
          </article>
          `,
        },
      }),
      configure({
        hitsPerPage: 8,
        clickAnalytics: true,
      }),
      panel({
        templates: { header: 'brand' },
      })(refinementList)({
        container: '#brand-list',
        attribute: 'brand',
      }),
      clearRefinements({
        container: '#clear-refinements',
      }),
      currentRefinements({
        container: '#current-refinements',
      }),
      pagination({
        container: '#pagination',
      }),
    ]);
  } else {
    const objectID = route.substring(1);
    const index = searchClient.initIndex('Sending Events');
    index.search(objectID).then(({ hits }) => {
      const product = hits[0];
      console.log(product);
      appDiv.innerHTML = `
        <a href="/" class="button">⬅ Back</a>
        <div id="pdp">
          <div id="productImage">
            <img src="${product.image}" />
          </div>
          <h2>${product.name}</h2>
          <p>${product.description}</p>
          <h1>\$${product.price}</h1>
          <a class="button" onClick="alert('Yes');">Add to cart</a>
        </div>`;
    });
  }
};

const navigate = (e) => {
  const route = e.target.pathname;
  window.history.pushState({}, '', route);
  renderContent(route);
};

const registerBrowserBackAndForth = () => {
  window.onpopstate = function (e) {
    const route = window.location.pathname;
    renderContent(route);
  };
};

const renderInitialPage = () => {
  const route = window.location.pathname;
  renderContent(route);
};

(function bootup() {
  registerBrowserBackAndForth();
  renderInitialPage();
})();

search.start();
