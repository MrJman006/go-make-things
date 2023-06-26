import { component } from "../vendors/reef/reef.es.min.js"

function _generateCartIconHtml(cart)
{
    let productCount = cart.items().length;

    let cartIconHtml = `
        <span aria-hidden="true">&#x1f6d2;</span> Cart <span>${productCount}</span>
    `;

    return cartIconHtml;
}

function buildCartIcon(cart)
{
    let cartIconContainer = document.querySelector("[data-icon=\"cart\"]");

    component(
        cartIconContainer,
        () =>{ return _generateCartIconHtml(cart); }
    );
}

export {
    buildCartIcon
};
