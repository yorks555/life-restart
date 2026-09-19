// Shared local profile; keep the original birthday key for existing installations.
const Profile = {
  today() {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  },
  validBirth(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return value >= '1900-01-31' && value <= this.today() && y <= 2100 &&
      date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  },
  birth() {
    const value = Store.get('profile', '');
    return this.validBirth(value) ? value : '';
  },
  name() { return String(Store.get('profile_name', '') || '').slice(0, 24); },
  fortuneInput() {
    const saved = Store.get('fortune_input', {}) || {};
    const name = typeof saved.name === 'string' ? saved.name.trim() : this.name();
    return { name: name || '无名氏', zodiac: saved.zodiac || '白羊座' };
  },
  bindBirthday(input) {
    input.min = '1900-01-31';
    input.max = this.today();
    if (this.birth()) input.value = this.birth();
  }
};
