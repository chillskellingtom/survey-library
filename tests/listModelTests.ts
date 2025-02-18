import { Action, IAction } from "../src/actions/action";
import { ElementHelper } from "../src/element-helper";
import { ListModel } from "../src/list";
import { createIActionArray, createListContainerHtmlElement } from "./utilstests";

export default QUnit.module("List Model");
const oldValueMINELEMENTCOUNT = ListModel.MINELEMENTCOUNT;

QUnit.test("ListModel less than or equal to MINELEMENTCOUNT", function (assert) {
  ListModel.MINELEMENTCOUNT = 5;
  const items = createIActionArray(4);
  const list = new ListModel(items, () => { }, true);

  assert.equal(list.renderedActions.length, 4);
  assert.equal(list.renderedActions.filter(item => item.visible).length, 4);
  assert.notOk(list.showFilter);

  ListModel.MINELEMENTCOUNT = oldValueMINELEMENTCOUNT;
});

QUnit.test("ListModel greater MINELEMENTCOUNT", function (assert) {
  ListModel.MINELEMENTCOUNT = 5;
  const items = createIActionArray(7);
  items.push(<IAction>{ id: "test8", title: "test8", visible: false });
  const list = new ListModel(items, () => { }, true);

  assert.equal(list.renderedActions.length, 8);
  assert.equal(list.renderedActions.filter(item => list.isItemVisible(item)).length, 7);
  assert.ok(list.showFilter);

  list.filterString = "test";
  assert.equal(list.renderedActions.length, 8);
  assert.equal(list.renderedActions.filter(item => list.isItemVisible(item)).length, 7);

  list.filterString = "1";
  assert.equal(list.renderedActions.length, 8);
  assert.equal(list.renderedActions.filter(item => list.isItemVisible(item)).length, 1);

  ListModel.MINELEMENTCOUNT = oldValueMINELEMENTCOUNT;
});

QUnit.test("ListModel reassign items", function (assert) {
  ListModel.MINELEMENTCOUNT = 5;
  const items = createIActionArray(4);
  const list = new ListModel(items, () => { }, true);

  assert.equal(list.renderedActions.length, 4);
  assert.equal(list.renderedActions.filter(item => item.visible).length, 4);
  assert.notOk(list.showFilter);

  list.setItems(createIActionArray(7));

  assert.equal(list.renderedActions.length, 7);
  assert.equal(list.renderedActions.filter(item => item.visible).length, 7);
  assert.ok(list.showFilter);

  ListModel.MINELEMENTCOUNT = oldValueMINELEMENTCOUNT;
});

QUnit.test("hasText method", assert => {
  const listModel = new ListModel([], () => { }, true);
  const item = new Action({ id: "1", title: "Best test1" });
  assert.ok(listModel["hasText"](item, "test"));
  assert.ok(listModel["hasText"](item, "1"));
  assert.notOk(listModel["hasText"](item, "test2"));
  assert.ok(listModel["hasText"](item, "Best"));
  assert.ok(listModel["hasText"](item, "best"));
});

class MyObject {
  myOnFilter(text: string) {
    this.myItems.forEach(item => {
      item.visible = !!text ? item.title.indexOf("1") !== -1 : true;
    });
  }
  constructor(public myItems: Array<IAction>) {}
}

QUnit.test("ListModel custom onFilter", assert => {
  ListModel.MINELEMENTCOUNT = 5;
  const items = [
    new Action({ id: "test1", title: "test1" }),
    new Action({ id: "test2", title: "test2" }),
    new Action({ id: "test3", title: "test3" }),
    new Action({ id: "test4", title: "test4" }),
    new Action({ id: "test5", title: "test5" }),
    new Action({ id: "test6", title: "test6" }),
    new Action({ id: "test7", title: "test7" })
  ];
  const myObject = new MyObject(items);
  const list = new ListModel([], () => { }, true, null, (text: string) => { myObject.myOnFilter(text); });
  assert.equal(list.renderedActions.length, 0);

  list.setItems(myObject.myItems);

  assert.equal(list.renderedActions.length, 7, "initial list.renderedActions");
  assert.equal(list.renderedActions.filter(item => item.visible).length, 7, "initial list.renderedActions.filter(item => item.visible)");
  assert.ok(list.showFilter, "initial list.filterableListItems");

  list.filterString = "test";
  assert.equal(list.renderedActions.length, 7, "items filterString = test");
  assert.equal(list.renderedActions.filter(item => item.visible).length, 1, "items.filter(item => item.visible) filterString = test");
  assert.equal(myObject.myItems.filter(item => item.visible).length, 1, "myObject.myItems visible filterString = test");
  assert.equal(list.renderedActions.filter(item => item.visible)[0].title, "test1", "filterString = test");

  list.filterString = "1";
  assert.equal(list.renderedActions.length, 7, "items filterString = 1");
  assert.equal(list.renderedActions.filter(item => item.visible).length, 1, "items.filter(item => item.visible) filterString = 1");
  assert.equal(myObject.myItems.filter(item => item.visible).length, 1, "myObject.myItems visible filterString = 1");
  assert.equal(list.renderedActions.filter(item => item.visible)[0].title, "test1", "filterString = 1");

  list.setItems(items);
  list.refresh();
  assert.equal(list.filterString, "", "filterString is reset");

  ListModel.MINELEMENTCOUNT = oldValueMINELEMENTCOUNT;
});

QUnit.test("ListModel shows placeholder if there are no visible elements", function (assert) {
  const items = createIActionArray(12);
  const list = new ListModel(items, () => { }, true);

  assert.equal(list.renderedActions.length, 12);
  assert.equal(list.renderedActions.filter(item => list.isItemVisible(item)).length, 12);
  assert.notOk(list.isEmpty, "!isEmpty");

  list.filterString = "item";
  assert.equal(list.renderedActions.filter(item => list.isItemVisible(item)).length, 0);
  assert.ok(list.isEmpty, "isEmpty");
});

QUnit.test("ListModel focus item", function (assert) {
  const items = createIActionArray(12);
  const list = new ListModel(items, () => { }, true);

  assert.equal(list.renderedActions.length, 12);
  assert.equal(list.focusedItem, undefined);

  list.focusNextVisibleItem();
  assert.equal(list.focusedItem, list.actions[0]);

  list.focusNextVisibleItem();
  assert.equal(list.focusedItem, list.actions[1]);

  list.focusPrevVisibleItem();
  assert.equal(list.focusedItem, list.actions[0]);
});

QUnit.test("focusNextVisibleItem item", function (assert) {
  const items = createIActionArray(12);
  const list = new ListModel(items, () => { }, true);
  list.focusedItem = list.actions[list.actions.length - 1];

  list.focusNextVisibleItem();
  assert.ok(list.focusedItem === list.actions[0]);

  list.focusNextVisibleItem();
  assert.ok(list.focusedItem === list.actions[1]);
});

QUnit.test("focusNextVisibleItem item + filtration", function (assert) {
  const items = createIActionArray(12);
  const list = new ListModel(items, () => { }, true);
  list.filterString = "1";

  assert.equal(list.visibleItems.length, 3);

  list.focusNextVisibleItem();
  assert.ok(list.focusedItem === list.actions[1]);

  list.focusNextVisibleItem();
  assert.ok(list.focusedItem === list.actions[10]);
});

QUnit.test("focusPrevVisibleItem item", function (assert) {
  const items = createIActionArray(12);
  const list = new ListModel(items, () => { }, true);
  list.focusedItem = list.actions[0];

  list.focusPrevVisibleItem();
  assert.ok(list.focusedItem === list.actions[list.actions.length - 1]);

  list.focusPrevVisibleItem();
  assert.ok(list.focusedItem === list.actions[list.actions.length - 2]);
});
QUnit.test("focusPrevVisibleItem item + filtration", function (assert) {
  const items = createIActionArray(12);
  const list = new ListModel(items, () => { }, true);
  list.filterString = "1";
  assert.equal(list.visibleItems.length, 3);

  list.focusPrevVisibleItem();
  assert.ok(list.focusedItem === list.actions[1]);

  list.focusPrevVisibleItem();
  assert.ok(list.focusedItem === list.actions[list.actions.length - 1]);

  list.focusPrevVisibleItem();
  assert.ok(list.focusedItem === list.actions[list.actions.length - 2]);
});

QUnit.test("focusNextVisibleItem item if there is selected item", function (assert) {
  const items = createIActionArray(12);
  const list = new ListModel(items, () => { }, true, items[2]);

  list.focusNextVisibleItem();
  assert.ok(list.focusedItem === list.actions[2]);
});

QUnit.test("selectFocusedItem", function (assert) {
  const items = createIActionArray(12);
  const list = new ListModel(items, () => { }, true);
  list.filterString = "1";
  list.focusNextVisibleItem();
  assert.ok(list.focusedItem === list.actions[1]);
  assert.ok(list.selectedItem === undefined);

  list.selectFocusedItem();
  assert.ok(list.selectedItem === list.actions[1]);
});
QUnit.test("onMouseMove", function (assert) {
  const items = createIActionArray(12);
  const list = new ListModel(items, () => { }, true);
  list.filterString = "1";
  list.focusNextVisibleItem();
  assert.ok(list.focusedItem === list.actions[1]);

  list.onMouseMove(new MouseEvent("mouseMove"));
  assert.equal(list.focusedItem, undefined);
});
QUnit.test("add/remove scrollHandler", function (assert) {
  const items = createIActionArray(12);
  const list = new ListModel(items, () => { }, true);
  let result = 0;

  const element = createListContainerHtmlElement();
  list.initListContainerHtmlElement(element);

  assert.equal(ElementHelper.hasVerticalScroller(list.scrollableContainer), true);
  assert.equal(!!list.scrollHandler, false);
  assert.equal(result, 0);

  list.addScrollEventListener(() => { result++; });
  assert.equal(!!list.scrollHandler, true);
  assert.equal(result, 0);

  list.scrollableContainer.dispatchEvent(new CustomEvent("scroll"));
  assert.equal(result, 1);

  list.removeScrollEventListener();
  assert.equal(!!list.scrollHandler, true);
  assert.equal(result, 1);

  list.scrollableContainer.dispatchEvent(new CustomEvent("scroll"));
  assert.equal(result, 1);

  document.body.removeChild(element);
});
QUnit.test("onLastItemRended & hasVerticalScroller", function (assert) {
  const items = createIActionArray(12);
  const list = new ListModel(items, () => { }, true);
  const element = createListContainerHtmlElement();
  list.initListContainerHtmlElement(element);

  assert.equal(list.hasVerticalScroller, false);

  list.onLastItemRended(list.actions[list.actions.length - 1]);
  assert.equal(list.hasVerticalScroller, false);

  document.body.removeChild(element);
});

QUnit.test("onLastItemRended & hasVerticalScroller & isAllDataLoaded", function (assert) {
  const items = createIActionArray(12);
  const list = new ListModel(items, () => { }, true);
  const element = createListContainerHtmlElement();
  list.initListContainerHtmlElement(element);
  list.isAllDataLoaded = false;

  assert.equal(list.hasVerticalScroller, false);

  list.onLastItemRended(list.actions[list.actions.length - 1]);
  assert.equal(list.hasVerticalScroller, true);

  document.body.removeChild(element);
});

QUnit.test("emptyText & isAllDataLoaded", function (assert) {
  const items = createIActionArray(12);
  const list = new ListModel(items, () => { }, true);
  list.isAllDataLoaded = false;
  assert.equal(list.emptyMessage, "Loading...");

  list.isAllDataLoaded = true;
  assert.equal(list.emptyMessage, "No data to display");
});

QUnit.test("getItemClass", (assert) => {
  const items = createIActionArray(12);
  const list = new ListModel(items, () => { }, true);
  assert.equal(list.getItemClass(list.actions[0]), "sv-list__item");

  list.focusedItem = list.actions[0];
  assert.equal(list.getItemClass(list.actions[0]), "sv-list__item sv-list__item--focused");

  list.selectFocusedItem();
  assert.equal(list.getItemClass(list.actions[0]), "sv-list__item sv-list__item--focused sv-list__item--selected");
  assert.equal(list.getItemClass(list.actions[1]), "sv-list__item");

  list.actions[1].enabled = false;
  assert.equal(list.getItemClass(list.actions[1]), "sv-list__item sv-list__item--disabled");

  list.actions[1].css = "custom-css";
  assert.equal(list.getItemClass(list.actions[1]), "sv-list__item sv-list__item--disabled custom-css");
});

QUnit.test("allow show selected item with disabled selection", (assert) => {
  const items = createIActionArray(12);
  const list = new ListModel(items, () => { }, false);
  assert.equal(list.selectedItem, undefined, "no selected item");
  assert.equal(list.isItemSelected(items[0] as any), false, "selected item is false");

  list.selectedItem = items[0];
  assert.equal(list.selectedItem, items[0], "first item selected");
  assert.equal(list.isItemSelected(items[0] as any), true, "selected item is true");
});
