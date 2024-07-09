import {ClassName, DATA_KEY, SectionAttr, Selector} from './const';
import {getEventTarget, isCustom} from './utils';

export class HeadingSectionContoller {
    private __doc: Document;

    constructor(doc: Document) {
        this.__doc = doc;
        this.__doc.addEventListener('click', this._onDocClick);
    }

    open(id: string) {
        for (const elem of this._findSections(id)) {
            elem.classList.add(ClassName.Open);
        }
    }

    toggle(id: string) {
        for (const elem of this._findSections(id)) {
            elem.classList.toggle(ClassName.Open);
        }
    }

    close(id: string) {
        for (const elem of this._findSections(id)) {
            elem.classList.remove(ClassName.Open);
        }
    }

    destroy() {
        this.__doc.removeEventListener('click', this._onDocClick);
    }

    private _findSections(id: string) {
        return Array.from(
            this.__doc.querySelectorAll(
                `section[${SectionAttr.DataKey}=${DATA_KEY}][${SectionAttr.DataId}=${id}]`,
            ),
        );
    }

    private _onDocClick = (event: MouseEvent) => {
        if (isCustom(event)) return;

        const heading = this._findHeading(event);
        if (heading) this._toogleSection(heading);
    };

    private _findHeading(event: MouseEvent): HTMLElement | undefined {
        const target = getEventTarget(event);

        if (this._matchHeading(target)) return target as HTMLElement;

        const path = event.composedPath?.();
        return path?.find(this._matchHeading) as HTMLElement | undefined;
    }

    private _matchHeading = (target: EventTarget | null) => {
        if (!(target instanceof HTMLElement)) return false;

        return (
            target?.matches?.(Selector.Heading) && target.parentElement?.matches(Selector.Section)
        );
    };

    private _toogleSection(heading: HTMLElement) {
        const section = heading.parentElement;
        if (section instanceof HTMLElement) {
            section.classList.toggle(ClassName.Open);
        }
    }
}
