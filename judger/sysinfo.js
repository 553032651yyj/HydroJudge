const systeminformation = require('systeminformation');

function size(s, base = 1) {
    s *= base;
    const unit = 1024;
    const unitNames = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    for (const unitName of unitNames) {
        if (s < unit) return '{0} {1}'.format(Math.round(s * 10) / 10, unitName);
        s /= unit;
    }
    return '{0} {1}'.format(Math.round(s * unit), unitNames[unitNames.length - 1]);
}

const cache = {};

async function get() {
    const [Cpu, Memory, OsInfo, CurrentLoad, CpuFlags, CpuTemp, Battery] = await Promise.all([
        systeminformation.cpu(),
        systeminformation.mem(),
        systeminformation.osInfo(),
        systeminformation.currentLoad(),
        systeminformation.cpuFlags(),
        systeminformation.cpuTemperature(),
        systeminformation.battery(),
    ]);
    const cpu = `${Cpu.manufacturer} ${Cpu.brand}`;
    const memory = `${size(Memory.active)}/${size(Memory.total)}`;
    const osinfo = `${OsInfo.distro} ${OsInfo.release} ${OsInfo.codename} ${OsInfo.kernel} ${OsInfo.arch}`;
    const load = `${CurrentLoad.avgload}`;
    const flags = CpuFlags;
    let battery;
    if (!Battery.hasbattery) battery = 'No battery';
    else battery = `${Battery.type} ${Battery.model} ${Battery.percent}%${Battery.ischarging ? ' Charging' : ''}`;
    const _id = OsInfo.serial;
    cache.cpu = cpu;
    cache.osinfo = osinfo;
    cache.flags = flags;
    cache._id = _id;
    return {
        _id, cpu, memory, osinfo, load, flags, CpuTemp, battery,
    };
}

async function update() {
    const [Memory, CurrentLoad, CpuTemp, Battery] = await Promise.all([
        systeminformation.mem(),
        systeminformation.currentLoad(),
        systeminformation.cpuTemperature(),
        systeminformation.battery(),
    ]);
    const {
        _id, cpu, osinfo, flags,
    } = cache;
    const memory = `${size(Memory.active)}/${size(Memory.total)}`;
    const load = `${CurrentLoad.avgload}`;
    let battery;
    if (!Battery.hasbattery) battery = 'No battery';
    else battery = `${Battery.type} ${Battery.model} ${Battery.percent}%${Battery.ischarging ? ' Charging' : ''}`;
    return [
        _id,
        {
            memory, load, battery, CpuTemp,
        },
        {
            _id, cpu, memory, osinfo, load, flags, battery, CpuTemp,
        },
    ];
}

module.exports = { get, update };
