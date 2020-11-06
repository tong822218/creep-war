import { filter } from "lodash";
import { ErrorMapper } from "utils/ErrorMapper";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // console.log(`Current game tick is ${Game.time}`);

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  const creepNum = Object.keys(Game.creeps).length;

  if (creepNum < 3) {
    Game.spawns.Spawn1.spawnCreep(
      [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
      "worker" + new Date().getTime().toString(),
      {
        memory: {
          role: "worker",
          room: Game.spawns.Spawn1.room.name,
          working: true,
          task: "harvesting"
        }
      }
    );
  }
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];

    // 如果creep身上的能量满了就去修路或者升级控制器
    if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
      creep.memory.task = "building";
    }
    if (creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.task = "harvesting";
    }

    // 去获取资源
    if (creep.memory.task === "harvesting") {
      const target = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
      if (target) {
        if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      }
    }

    // 有未满的 spawn 或者 extension 就去填充
    const con = creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: i => {
        return (
          (i.structureType === STRUCTURE_EXTENSION || i.structureType === STRUCTURE_SPAWN) &&
          i.store[RESOURCE_ENERGY] !== i.store.getCapacity(RESOURCE_ENERGY)
        );
      }
    });
    if (con && creep.memory.task === "building") {
      if (creep.transfer(con, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(con);
      }
    } else {
      // 去修路，或者升级控制器
      if (creep.memory.task === "building") {
        const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if (target) {
          if (creep.build(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
          }
        } else {
          if (creep.room.controller) {
            if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
              creep.moveTo(creep.room.controller);
            }
          }
        }
      }
    }
  }
});
