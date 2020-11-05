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

  let creepNum = 0
  for(const name in Game.creeps){
    creepNum++
  }
  if(creepNum < 2){
    Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE]);
  }
  for(const name in Game.creeps){
    let creep = Game.creeps[name]

    // 如果creep身上的能量满了就去修路或者升级控制器
    if(creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
      creep.memory.task = 'building'
    }
    if(creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.task = 'harvesting'
    }

    // 去获取资源
    if(creep.memory.task == 'harvesting') {
      const target = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
      if(target) {
          if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
              creep.moveTo(target);
          }
      }
    }

    // 去修路，或者升级控制器
    if(creep.memory.task == 'building') {
      const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
      if(target) {
          if(creep.build(target) == ERR_NOT_IN_RANGE) {
              creep.moveTo(target);
          }
      } else {
        if(creep.room.controller) {
          if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
              creep.moveTo(creep.room.controller);
          }
        }
      }

    }

  }

});
