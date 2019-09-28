import { LitElement, html } from 'https://unpkg.com/@polymer/lit-element@0.6.5/lit-element.js?module';

const styles = html`
  <style>
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
    }
    ha-card {
      flex-direction: column;
      flex: 1;
      position: relative;
      padding: 0px;
      border-radius: 4px;
      overflow: hidden;
    }

    .preview {
      cursor: pointer;
      overflow: hidden;
      position: relative;
    }

    .fill-gap {
      flex-grow: 1;
    }

    .battery {
      text-align: right;
      font-weight: bold;
      padding: 15px;
    }

    .status {
      font-weight: bold;
      padding: 15px 20px;
      text-align: left;
    }

    .stats {
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
    }

    .stats-block {
      margin: 10px 0px;
      text-align: center;
      border-right: 1px solid rgba(255, 255, 255, 0.2);
      flex-grow: 1;
    }

    .stats-block:last-child {
      border: 0px;
    }

    .stats-hours {
      font-size: 20px;
      font-weight: bold;
    }

    @keyframes cleaning {
      0% {
        transform: translate(0);
      }

      20% {
        transform: translate(-2px, 2px);
      }
      40% {
        transform: translate(-2px, -2px);
      }
      60% {
        transform: translate(2px, 2px);
      }
      80% {
        transform: translate(2px, -2px);
      }
      100% {
        transform: translate(0);
      }
    }

    ha-icon {
      color: #fff;
    }

    .toolbar {
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      min-height: 30px;
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
    }

    .toolbar paper-icon-button {
      color: #2980b9;
      flex-direction: column;
      width: 44px;
      height: 54px;
      margin-right: 10px;
      padding: 10px;
    }

    .toolbar paper-button {
      color: #2980b9;
      flex-direction: column;
      margin-right: 10px;
      padding: 15px 10px;
      cursor: pointer;
    }

    .toolbar paper-icon-button:last-child {
      margin-right: 0px;
    }

    .toolbar paper-icon-button:active, .toolbar paper-button:active {
      opacity: 0.4;
      background: rgba(0, 0, 0, 0.1);
    }

    .toolbar paper-button {
      color: #2980b9;
      flex-direction: row;
    }

    .toolbar ha-icon {
      color: #2980b9;
      padding-right: 15px;
    }

    .header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }

    .source-menu {
      padding: 0;
      margin-top: 15px;
    }

    .toolbar-split {
      padding-right: 15px;
    }
  </style>
`

class VacuumCard extends LitElement {
  static get properties() {
    return {
      hass: Object,
      config: Object,
    }
  }

  get entity() {
    return this.hass.states[this.config.entity]
  }

  handleMore() {
    const e = new Event('hass-more-info', { bubbles: true, composed: true })
    e.detail = { entityId: this.entity.entity_id }
    this.dispatchEvent(e);
  }

  handleSpeed(e) {
    const fan_speed = e.target.getAttribute('value');
    this.callService('set_fan_speed', {
      fan_speed
    });
  }

  callService(service, options = {}) {
    this.hass.callService('vacuum', service, {
      entity_id: this.config.entity,
      ...options
    });
  }

  renderSource() {
    const {
      attributes: {
        fan_speed: source,
        fan_speed_list: sources
      }
    } = this.entity;

    const selected = sources.indexOf(source);
    return html`
      <paper-menu-button class='source-menu' slot='dropdown-trigger'
        .horizontalAlign=${'right'} .verticalAlign=${'top'}
        .verticalOffset=${40} .noAnimations=${true}
        @click='${(e) => e.stopPropagation()}'>
        <paper-button class='source-menu__button' slot='dropdown-trigger'>
          <span class='source-menu__source' show=${true}>
            ${source}
          </span>
          <ha-icon icon="mdi:fan"></ha-icon>
        </paper-button>
        <paper-listbox slot='dropdown-content' selected=${source}
          @click='${(e) => this.handleSpeed(e)}'>
          ${sources.map(item => html`<paper-item value=${item}>${item}</paper-item>`)}
        </paper-listbox>
      </paper-menu-button>`;
  }

  renderVacuumStats() {
    const {
      attributes: {
        mainBrush,
        sideBrush,
        filter,
        sensor
      }
    } = this.entity

    return html`
      <div class="stats-block">
        <span class="stats-hours">${filter}</span> <sup>hours</sup>
        <div class="stats-subtitle">Filter</div>
      </div>
      <div class="stats-block">
        <span class="stats-hours">${sideBrush}</span> <sup>hours</sup>
        <div class="stats-subtitle">Side brush</div>
      </div>
      <div class="stats-block">
        <span class="stats-hours">${mainBrush}</span> <sup>hours</sup>
        <div class="stats-subtitle">Main brush</div>
      </div>
      <div class="stats-block">
        <span class="stats-hours">${sensor}</span> <sup>hours</sup>
        <div class="stats-subtitle">Sensors</div>
      </div>
    `
  }

  renderLastCleanStats() {
    const {
      attributes: {
        last_run_stats: {
          area,
          duration,
        }
      }
    } = this.entity

    return html`
      <div class="stats-block">
        <span class="stats-hours">${area}</span> m<sup>2</sup>
        <div class="stats-subtitle">Last cleaned area</div>
      </div>
      <div class="stats-block">
        <span class="stats-hours">${Math.round(duration / 60)}</span> minutes
        <div class="stats-subtitle">Last cleaning time</div>
      </div>
    `
  }

  renderCleaningToolbar() {
    return html`
      <div class="toolbar">
        <paper-button @click='${(e) => this.callService('return_to_base')}'>
          <ha-icon icon="hass:home-map-marker" ></ha-icon>
          Return to dock
        </paper-button>
      </div>
    `
  }

  renderDockedToolbar() {
    const { actions } = this.config
    const buttons = actions.map(({ name, service, icon, data }) => {
      const execute = () => {
        const args = service.split('.')
        this.hass.callService(args[0], args[1], data);
      }
      return html`<paper-icon-button icon="${icon}" title="${name}" @click='${execute}'></paper-icon-button>`
    })

    return html`
      <div class="toolbar">
        <paper-icon-button  icon="hass:play"
                            title="Clean" class="toolbar-icon"
                            @click='${(e) => this.callService('start')}'>
        </paper-icon-button>
        <paper-icon-button  icon="mdi:crosshairs-gps"
                            title="Locate vacuum" class="toolbar-split"
                            @click='${(e) => this.callService('locate')}'>
        </paper-icon-button>
        <div class="fill-gap"></div>
        ${buttons}
      </div>
    `
  }

  renderMapCard() {
    if (this.mapCard) {
      return this.mapCard;
    }

    this.mapCard = document.createElement('valetudo-map-card');
    this.mapCard.setConfig(this.config.map);

    // After render
    setTimeout(() => this.mapCard.hass = this.hass);

    return this.mapCard;
  }

  render() {
    const {
      state,
      attributes: {
        status,
        battery_level,
        battery_icon,
      }
    } = this.entity

    const cleaning = state !== 'docked'

    return html`
      ${styles}
      <ha-card>
        <div class="preview" @click='${(e) => this.handleMore()}' ?more-info=true>
          <div class="header">
            <div class="status">${status}</div>
            <div>
              ${this.renderSource()}
            </div>
            <div class="battery">
              ${battery_level}% <ha-icon icon="${battery_icon}"></ha-icon>
            </div>
          </div>

          <div class="stats" @click='${(evt) => { window.open('http://192.168.1.25'); evt.stopPropagation() }}'>
            ${this.renderLastCleanStats()}
          </div>

          <div class="stats">
            ${this.renderVacuumStats()}
          </div>
        </div>
        ${cleaning ? this.renderCleaningToolbar() : this.renderDockedToolbar()}
        ${this.renderMapCard()}
      </ha-card>
    `
  }

  setConfig(config) {
    this.config = config;
  }

  getCardSize() {
    return 2;
  }
}

customElements.define('vacuum-card', VacuumCard);
