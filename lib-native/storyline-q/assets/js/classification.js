/* Multiple answers per category; Pointer Events cover mouse, pen and touch. */
Vue.component('classification-board', {
  props: ['question', 'items', 'assignments', 'results', 'locked'],
  data() {
    return { selectedId: null, overZone: null, overItemId: null, placementOrder: [], poolOrder: [] };
  },
  watch: {
    locked(value) {
      if (value) {
        this.cancelPointer();
        this.selectedId = null;
      }
    },
  },
  beforeDestroy() { this.cancelPointer(); },
  methods: {
    swap(sourceId, targetId) {
      if (this.locked || sourceId === targetId ||
          !this.items.some((item) => item.id === sourceId) ||
          !this.items.some((item) => item.id === targetId)) return;
      const next = { ...this.assignments };
      const sourceCategory = next[sourceId];
      const targetCategory = next[targetId];
      const exchange = (id) => id === sourceId ? targetId : id === targetId ? sourceId : id;
      // Capture the visible order before exchanging category assignments.
      this.placementOrder = this.question.categories.flatMap((category) =>
        this.categoryItems(category.id).map((item) => exchange(item.id)));
      this.poolOrder = this.poolItems().map((item) => exchange(item.id));
      if (targetCategory === undefined) delete next[sourceId];
      else next[sourceId] = targetCategory;
      if (sourceCategory === undefined) delete next[targetId];
      else next[targetId] = sourceCategory;
      this.$emit('change', next);
      this.selectedId = null;
    },
    poolItems() {
      const unplaced = this.items.filter((item) =>
        !this.question.categories.some((category) => category.id === this.assignments[item.id]));
      const positions = new Map(this.poolOrder.map((id, index) => [id, index]));
      return unplaced.sort((a, b) =>
        (positions.get(a.id) ?? Infinity) - (positions.get(b.id) ?? Infinity));
    },
    place(id, zone) {
      if (this.locked || !this.items.some((item) => item.id === id)) return;
      const next = { ...this.assignments };
      if (zone === 'pool') delete next[id];
      else {
        const category = this.question.categories[Number(zone)];
        if (!category) return;
        if (next[id] === category.id) {
          this.selectedId = null;
          return;
        }
        const capacity = this.question.drags.filter((item) => item.categoryId === category.id).length;
        const count = this.items.filter((item) => next[item.id] === category.id).length;
        if (count >= capacity) return;
        next[id] = category.id;
      }
      this.placementOrder = this.placementOrder.filter((itemId) => itemId !== id);
      if (zone !== 'pool') this.placementOrder.push(id);
      this.$emit('change', next);
      this.selectedId = null;
    },
    categoryItems(categoryId) {
      const items = this.items.filter((item) => this.assignments[item.id] === categoryId);
      const positions = new Map(this.placementOrder.map((id, index) => [id, index]));
      return items.sort((a, b) =>
        (positions.get(a.id) ?? Infinity) - (positions.get(b.id) ?? Infinity));
    },
    select(item) {
      if (this.locked || Date.now() < (this._suppressClickUntil || 0)) return;
      this.selectedId = this.selectedId === item.id ? null : item.id;
    },
    selectZone(zone) {
      if (Date.now() < (this._suppressClickUntil || 0)) return;
      if (this.selectedId !== null) this.place(this.selectedId, zone);
    },
    startPointer(event, item) {
      if (this.locked || event.button !== 0 || this._pointer) return;
      const source = event.currentTarget;
      this._pointer = {
        id: item.id, pointerId: event.pointerId, source,
        x: event.clientX, y: event.clientY, ghost: null
      };
      source.setPointerCapture(event.pointerId);
    },
    zoneAt(x, y) {
      const zone = document.elementFromPoint(x, y)?.closest('[data-classification-zone]');
      return zone && this.$el.contains(zone) ? zone.dataset.classificationZone : null;
    },
    movePointer(event) {
      const pointer = this._pointer;
      if (!pointer || event.pointerId !== pointer.pointerId) return;
      if (!pointer.ghost && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < 6) return;
      event.preventDefault();
      if (!pointer.ghost) {
        const rect = pointer.source.getBoundingClientRect();
        const ghost = pointer.source.cloneNode(true);
        ghost.classList.add('classification-ghost');
        ghost.style.width = rect.width + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.setAttribute('aria-hidden', 'true');
        ghost.removeAttribute('tabindex');
        document.body.appendChild(ghost);
        pointer.ghost = ghost;
        pointer.source.style.opacity = '0.3';
      }
      pointer.ghost.style.left = event.clientX + 'px';
      pointer.ghost.style.top = event.clientY + 'px';
      this.overZone = this.zoneAt(event.clientX, event.clientY);
      const target = document.elementFromPoint(event.clientX, event.clientY)
        ?.closest('[data-classification-item]');
      const targetItem = target && this.$el.contains(target)
        ? this.items.find((item) => String(item.id) === target.dataset.classificationItem)
        : null;
      this.overItemId = targetItem && targetItem.id !== pointer.id ? targetItem.id : null;
    },
    endPointer(event) {
      const pointer = this._pointer;
      if (!pointer || event.pointerId !== pointer.pointerId) return;
      if (pointer.ghost) {
        const target = document.elementFromPoint(event.clientX, event.clientY)
          ?.closest('[data-classification-item]');
        const targetItem = target && this.$el.contains(target)
          ? this.items.find((item) => String(item.id) === target.dataset.classificationItem)
          : null;
        const zone = this.zoneAt(event.clientX, event.clientY);
        if (targetItem) this.swap(pointer.id, targetItem.id);
        else if (zone !== null) this.place(pointer.id, zone);
        this._suppressClickUntil = Date.now() + 350;
      }
      this.cancelPointer();
    },
    cancelPointer() {
      const pointer = this._pointer;
      this._pointer = null;
      if (pointer) {
        pointer.ghost?.remove();
        pointer.source.style.opacity = '';
        if (pointer.source.hasPointerCapture(pointer.pointerId)) {
          pointer.source.releasePointerCapture(pointer.pointerId);
        }
      }
      this.overZone = null;
      this.overItemId = null;
    },
    card(h, item) {
      const result = this.results[item.id];
      return h('button', {
        key: item.id,
        class: {
          'classification-card': true, selected: this.selectedId === item.id,
          'swap-target': this.overItemId === item.id,
          correct: result === true, incorrect: result === false
        },
        attrs: { type: 'button', disabled: this.locked, 'aria-pressed': this.selectedId === item.id,
          'data-classification-item': item.id },
        on: {
          click: (event) => { event.stopPropagation(); this.select(item); },
          keydown: (event) => { event.stopPropagation(); },
          pointerdown: (event) => this.startPointer(event, item),
          pointermove: this.movePointer, pointerup: this.endPointer,
          pointercancel: this.cancelPointer, lostpointercapture: this.cancelPointer,
          dragstart: (event) => event.preventDefault(),
        },
      }, [item.img ? h('img', { attrs: { src: item.img, alt: item.alt || '', draggable: false } }) : null,
      item.text ? h('p', item.text) : null]);
    },
    zone(h, zone, label, items, pool) {
      const cards = items.map((item) => this.card(h, item));
      const category = pool ? null : this.question.categories[Number(zone)];
      const capacity = category
        ? this.question.drags.filter((item) => item.categoryId === category.id).length : 0;
      if (category && !this.locked && this.overZone === zone && this.overItemId === null &&
          this._pointer && this.assignments[this._pointer.id] !== category.id && items.length < capacity) {
        cards.push(h('div', {
          key: 'classification-drop-placeholder',
          class: 'classification-drop-placeholder',
          attrs: { 'aria-hidden': 'true' },
        }));
      }
      return h('div', {
        key: zone,
        class: {
          'classification-zone': true, 'classification-pool': pool,
          'classification-table': !pool, 'drag-over': this.overZone === zone
        },
        attrs: {
          'data-classification-zone': zone, role: 'group', 'aria-label': label,
          tabindex: this.locked ? -1 : 0
        },
        on: {
          click: () => this.selectZone(zone),
          keydown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault(); this.selectZone(zone);
            } else if (event.key === 'Escape') this.selectedId = null;
          },
        },
      }, [h('p', { class: 'classification-heading' }, label),
      h('div', { class: 'classification-items' }, cards)]);
    },
  },
  render(h) {
    const categories = this.question.categories;
    const unplaced = this.poolItems();
    return h('div', { class: 'classification-board' }, [
      this.zone(h, 'pool', '', unplaced, true),
      h('div', { class: 'classification-tables', style: { gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` } },
        categories.map((category, index) => this.zone(h, String(index), category.title,
          this.categoryItems(category.id), false))),
    ]);
  },
});
