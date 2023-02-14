import { IPostDBLoadModAsync } from "@spt-aki/models/external/IPostDBLoadModAsync";
import { LogBackgroundColor } from "@spt-aki/models/spt/logging/LogBackgroundColor";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { DependencyContainer } from "tsyringe";

class CustomStamina implements IPostDBLoadModAsync
{
    public async postDBLoadAsync(container: DependencyContainer): Promise<void>
    {
        // Get the configuration options.
        const config = await import("../config/config.json");

        // Get the logger from the server container.
        const logger = container.resolve<ILogger>("WinstonLogger");

        // Check to see if the mod is enabled.
        const enabled:boolean = config.mod_enabled;
        if (!enabled)
        {
            logger.logWithColor("CustomStamina is disabled in the config file.", LogTextColor.RED, LogBackgroundColor.DEFAULT);
            return;
        }

        // Verbose logging?
        const debug:boolean = config.debug;

        // Get database from server.
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");

        // Get in-memory stamina configuration data.
        const stamina = databaseServer.getTables().globals.config.Stamina;
        
        if (config.adjustment_method === "unlimited")
        {
            stamina.AimConsumptionByPose.x = 0;
            stamina.AimConsumptionByPose.y = 0;
            stamina.AimConsumptionByPose.z = 0;
            stamina.AimDrainRate = 0;
            stamina.AimRangeFinderDrainRate = 0;
            stamina.BaseHoldBreathConsumption = 0;
            stamina.BaseRestorationRate = 500;
            stamina.Capacity = 500;
            stamina.CrouchConsumption.x = 0; // consumption moving while crouched?
            stamina.CrouchConsumption.y = 0; 
            stamina.GrenadeHighThrow = 0;
            stamina.GrenadeLowThrow = 0;
            stamina.HoldBreathStaminaMultiplier.x = 0;
            stamina.HoldBreathStaminaMultiplier.y = 0;
            stamina.HandsCapacity = 500;
            stamina.HandsRestoration = 500;
            stamina.JumpConsumption = 0;
            stamina.OxygenCapacity = 500;
            stamina.OxygenRestoration = 500;
            stamina.PoseLevelConsumptionPerNotch.x = 0; // consumption raising crouch/pose level
            stamina.PoseLevelConsumptionPerNotch.y = 0;
            stamina.ProneConsumption = 0;
            stamina.SitToStandConsumption = 0;
            stamina.SprintDrainRate = 0;
            stamina.StaminaExhaustionCausesJiggle = false;
            stamina.StaminaExhaustionRocksCamera = false;
            stamina.StaminaExhaustionStartsBreathSound = false;
            stamina.StandupConsumption.x = 0; // consumption standing up from prone
            stamina.StandupConsumption.y = 0;
            stamina.WalkConsumption.x = 0;
            stamina.WalkConsumption.y = 0;

            logger.logWithColor("CustomStamina: All breath, leg, and hand stamina settings have been set to unlimited.", LogTextColor.CYAN, LogBackgroundColor.DEFAULT);
        }
        else if (config.adjustment_method === "percent")
        {
            stamina.AimConsumptionByPose.x = this.calculateRelativePercentage(-(config.percent_stamina), stamina.AimConsumptionByPose.x);
            stamina.AimConsumptionByPose.y = this.calculateRelativePercentage(-(config.percent_stamina), stamina.AimConsumptionByPose.y);
            stamina.AimConsumptionByPose.z = this.calculateRelativePercentage(-(config.percent_stamina), stamina.AimConsumptionByPose.z);
            stamina.AimDrainRate = this.calculateRelativePercentage(-(config.percent_stamina), stamina.AimDrainRate);
            stamina.AimRangeFinderDrainRate = this.calculateRelativePercentage(-(config.percent_stamina), stamina.AimRangeFinderDrainRate);
            stamina.BaseHoldBreathConsumption = this.calculateRelativePercentage(-(config.percent_stamina), stamina.BaseHoldBreathConsumption);
            stamina.BaseRestorationRate = this.calculateRelativePercentage(config.percent_stamina, stamina.BaseRestorationRate);
            stamina.Capacity = this.calculateRelativePercentage(config.percent_stamina, stamina.Capacity);
            stamina.CrouchConsumption.x = this.calculateRelativePercentage(-(config.percent_stamina), stamina.CrouchConsumption.x);
            stamina.CrouchConsumption.y = this.calculateRelativePercentage(-(config.percent_stamina), stamina.CrouchConsumption.y);
            stamina.GrenadeHighThrow = this.calculateRelativePercentage(-(config.percent_stamina), stamina.GrenadeHighThrow);
            stamina.GrenadeLowThrow = this.calculateRelativePercentage(-(config.percent_stamina), stamina.GrenadeLowThrow);
            stamina.HoldBreathStaminaMultiplier.x = this.calculateRelativePercentage(-(config.percent_stamina), stamina.HoldBreathStaminaMultiplier.x);
            stamina.HoldBreathStaminaMultiplier.y = this.calculateRelativePercentage(-(config.percent_stamina), stamina.HoldBreathStaminaMultiplier.y);
            stamina.HandsCapacity = this.calculateRelativePercentage(config.percent_stamina, stamina.HandsCapacity);
            stamina.HandsRestoration = this.calculateRelativePercentage(config.percent_stamina, stamina.HandsRestoration);
            stamina.JumpConsumption = this.calculateRelativePercentage(-(config.percent_stamina), stamina.JumpConsumption);
            stamina.OxygenCapacity = this.calculateRelativePercentage(config.percent_stamina, stamina.OxygenCapacity);
            stamina.OxygenRestoration = this.calculateRelativePercentage(config.percent_stamina, stamina.OxygenRestoration);
            stamina.PoseLevelConsumptionPerNotch.x = this.calculateRelativePercentage(-(config.percent_stamina), stamina.PoseLevelConsumptionPerNotch.x);
            stamina.PoseLevelConsumptionPerNotch.y = this.calculateRelativePercentage(-(config.percent_stamina), stamina.PoseLevelConsumptionPerNotch.y);
            stamina.ProneConsumption = this.calculateRelativePercentage(-(config.percent_stamina), stamina.ProneConsumption);
            stamina.SitToStandConsumption = this.calculateRelativePercentage(-(config.percent_stamina), stamina.SitToStandConsumption);
            stamina.SprintDrainRate = this.calculateRelativePercentage(-(config.percent_stamina), stamina.SprintDrainRate);
            stamina.StandupConsumption.x = this.calculateRelativePercentage(-(config.percent_stamina), stamina.StandupConsumption.x);
            stamina.StandupConsumption.y = this.calculateRelativePercentage(-(config.percent_stamina), stamina.StandupConsumption.y);
            stamina.WalkConsumption.x = this.calculateRelativePercentage(-(config.percent_stamina), stamina.WalkConsumption.x);
            stamina.WalkConsumption.y = this.calculateRelativePercentage(-(config.percent_stamina), stamina.WalkConsumption.y);

            logger.logWithColor(`CustomStamina: All breath, leg, and hand stamina settings have been adjusted by ${(config.percent_stamina > 0 ? "+" : "")}${config.percent_stamina}%.`, LogTextColor.CYAN, LogBackgroundColor.DEFAULT);
        }
        else if (config.adjustment_method === "fixed")
        {
            if (debug && stamina.AimConsumptionByPose.x !== config.AimConsumptionByPose.x)
                logger.debug(`CustomStamina: Value for 'AimConsumptionByPose.x' has been been adjusted from ${stamina.AimConsumptionByPose.x} to ${config.AimConsumptionByPose.x}.`);
            stamina.AimConsumptionByPose.x = config.AimConsumptionByPose.x;

            if (debug && stamina.AimConsumptionByPose.y !== config.AimConsumptionByPose.y)
                logger.debug(`CustomStamina: Value for 'AimConsumptionByPose.y' has been been adjusted from ${stamina.AimConsumptionByPose.y} to ${config.AimConsumptionByPose.y}.`);
            stamina.AimConsumptionByPose.y = config.AimConsumptionByPose.y;

            if (debug && stamina.AimConsumptionByPose.z !== config.AimConsumptionByPose.z)
                logger.debug(`CustomStamina: Value for 'AimConsumptionByPose.z' has been been adjusted from ${stamina.AimConsumptionByPose.z} to ${config.AimConsumptionByPose.z}.`);
            stamina.AimConsumptionByPose.z = config.AimConsumptionByPose.z;

            if (debug && stamina.AimDrainRate !== config.AimDrainRate)
                logger.debug(`CustomStamina: Value for 'AimDrainRate' has been been adjusted from ${stamina.AimDrainRate} to ${config.AimDrainRate}.`);
            stamina.AimDrainRate = config.AimDrainRate;

            if (debug && stamina.AimRangeFinderDrainRate !== config.AimRangeFinderDrainRate)
                logger.debug(`CustomStamina: Value for 'AimRangeFinderDrainRate' has been been adjusted from ${stamina.AimRangeFinderDrainRate} to ${config.AimRangeFinderDrainRate}.`);
            stamina.AimRangeFinderDrainRate = config.AimRangeFinderDrainRate;
            
            if (debug && stamina.BaseHoldBreathConsumption !== config.BaseHoldBreathConsumption)
                logger.debug(`CustomStamina: Value for 'BaseHoldBreathConsumption' has been been adjusted from ${stamina.BaseHoldBreathConsumption} to ${config.BaseHoldBreathConsumption}.`);
            stamina.BaseHoldBreathConsumption = config.BaseHoldBreathConsumption;
            
            if (debug && stamina.BaseRestorationRate !== config.BaseRestorationRate)
                logger.debug(`CustomStamina: Value for 'BaseRestorationRate' has been been adjusted from ${stamina.BaseRestorationRate} to ${config.BaseRestorationRate}.`);
            stamina.BaseRestorationRate = config.BaseRestorationRate;

            if (debug && stamina.Capacity !== config.Capacity)
                logger.debug(`CustomStamina: Value for 'Capacity' has been been adjusted from ${stamina.Capacity} to ${config.Capacity}.`);
            stamina.Capacity = config.Capacity;

            if (debug && stamina.CrouchConsumption.x !== config.CrouchConsumption.x)
                logger.debug(`CustomStamina: Value for 'CrouchConsumption.x' has been been adjusted from ${stamina.CrouchConsumption.x} to ${config.CrouchConsumption.x}.`);
            stamina.CrouchConsumption.x = config.CrouchConsumption.x;

            if (debug && stamina.CrouchConsumption.y !== config.CrouchConsumption.y)
                logger.debug(`CustomStamina: Value for 'CrouchConsumption.y' has been been adjusted from ${stamina.CrouchConsumption.y} to ${config.CrouchConsumption.y}.`);
            stamina.CrouchConsumption.y = config.CrouchConsumption.y;

            if (debug && stamina.GrenadeHighThrow !== config.GrenadeHighThrow)
                logger.debug(`CustomStamina: Value for 'GrenadeHighThrow' has been been adjusted from ${stamina.GrenadeHighThrow} to ${config.GrenadeHighThrow}.`);
            stamina.GrenadeHighThrow = config.GrenadeHighThrow;

            if (debug && stamina.GrenadeLowThrow !== config.GrenadeLowThrow)
                logger.debug(`CustomStamina: Value for 'GrenadeLowThrow' has been been adjusted from ${stamina.GrenadeLowThrow} to ${config.GrenadeLowThrow}.`);
            stamina.GrenadeLowThrow = config.GrenadeLowThrow;

            if (debug && stamina.HoldBreathStaminaMultiplier.x !== config.HoldBreathStaminaMultiplier.x)
                logger.debug(`CustomStamina: Value for 'HoldBreathStaminaMultiplier.x' has been been adjusted from ${stamina.HoldBreathStaminaMultiplier.x} to ${config.HoldBreathStaminaMultiplier.x}.`);
            stamina.HoldBreathStaminaMultiplier.x = config.HoldBreathStaminaMultiplier.x;

            if (debug && stamina.HoldBreathStaminaMultiplier.y !== config.HoldBreathStaminaMultiplier.y)
                logger.debug(`CustomStamina: Value for 'HoldBreathStaminaMultiplier.y' has been been adjusted from ${stamina.HoldBreathStaminaMultiplier.y} to ${config.HoldBreathStaminaMultiplier.y}.`);
            stamina.HoldBreathStaminaMultiplier.y = config.HoldBreathStaminaMultiplier.y;

            if (debug && stamina.HandsCapacity !== config.HandsCapacity)
                logger.debug(`CustomStamina: Value for 'HandsCapacity' has been been adjusted from ${stamina.HandsCapacity} to ${config.HandsCapacity}.`);
            stamina.HandsCapacity = config.HandsCapacity;

            if (debug && stamina.HandsRestoration !== config.HandsRestoration)
                logger.debug(`CustomStamina: Value for 'HandsRestoration' has been been adjusted from ${stamina.HandsRestoration} to ${config.HandsRestoration}.`);
            stamina.HandsRestoration = config.HandsRestoration;

            if (debug && stamina.JumpConsumption !== config.JumpConsumption)
                logger.debug(`CustomStamina: Value for 'JumpConsumption' has been been adjusted from ${stamina.JumpConsumption} to ${config.JumpConsumption}.`);
            stamina.JumpConsumption = config.JumpConsumption;

            if (debug && stamina.OxygenCapacity !== config.OxygenCapacity)
                logger.debug(`CustomStamina: Value for 'OxygenCapacity' has been been adjusted from ${stamina.OxygenCapacity} to ${config.OxygenCapacity}.`);
            stamina.OxygenCapacity = config.OxygenCapacity;

            if (debug && stamina.OxygenRestoration !== config.OxygenRestoration)
                logger.debug(`CustomStamina: Value for 'OxygenRestoration' has been been adjusted from ${stamina.OxygenRestoration} to ${config.OxygenRestoration}.`);
            stamina.OxygenRestoration = config.OxygenRestoration;

            if (debug && stamina.PoseLevelConsumptionPerNotch.x !== config.PoseLevelConsumptionPerNotch.x)
                logger.debug(`CustomStamina: Value for 'PoseLevelConsumptionPerNotch.x' has been been adjusted from ${stamina.PoseLevelConsumptionPerNotch.x} to ${config.PoseLevelConsumptionPerNotch.x}.`);
            stamina.PoseLevelConsumptionPerNotch.x = config.PoseLevelConsumptionPerNotch.x;

            if (debug && stamina.PoseLevelConsumptionPerNotch.y !== config.PoseLevelConsumptionPerNotch.y)
                logger.debug(`CustomStamina: Value for 'PoseLevelConsumptionPerNotch.y' has been been adjusted from ${stamina.PoseLevelConsumptionPerNotch.y} to ${config.PoseLevelConsumptionPerNotch.y}.`);
            stamina.PoseLevelConsumptionPerNotch.y = config.PoseLevelConsumptionPerNotch.y;

            if (debug && stamina.ProneConsumption !== config.ProneConsumption)
                logger.debug(`CustomStamina: Value for 'ProneConsumption' has been been adjusted from ${stamina.ProneConsumption} to ${config.ProneConsumption}.`);
            stamina.ProneConsumption = config.ProneConsumption;

            if (debug && stamina.SitToStandConsumption !== config.SitToStandConsumption)
                logger.debug(`CustomStamina: Value for 'SitToStandConsumption' has been been adjusted from ${stamina.SitToStandConsumption} to ${config.SitToStandConsumption}.`);
            stamina.SitToStandConsumption = config.SitToStandConsumption;

            if (debug && stamina.SprintDrainRate !== config.SprintDrainRate)
                logger.debug(`CustomStamina: Value for 'SprintDrainRate' has been been adjusted from ${stamina.SprintDrainRate} to ${config.SprintDrainRate}.`);
            stamina.SprintDrainRate = config.SprintDrainRate;

            if (debug && stamina.StaminaExhaustionCausesJiggle !== config.StaminaExhaustionCausesJiggle)
                logger.debug(`CustomStamina: Value for 'StaminaExhaustionCausesJiggle' has been been adjusted from ${stamina.StaminaExhaustionCausesJiggle} to ${config.StaminaExhaustionCausesJiggle}.`);
            stamina.StaminaExhaustionCausesJiggle = config.StaminaExhaustionCausesJiggle;

            if (debug && stamina.StaminaExhaustionRocksCamera !== config.StaminaExhaustionRocksCamera)
                logger.debug(`CustomStamina: Value for 'StaminaExhaustionRocksCamera' has been been adjusted from ${stamina.StaminaExhaustionRocksCamera} to ${config.StaminaExhaustionRocksCamera}.`);
            stamina.StaminaExhaustionRocksCamera = config.StaminaExhaustionRocksCamera;

            if (debug && stamina.StaminaExhaustionStartsBreathSound !== config.StaminaExhaustionStartsBreathSound)
                logger.debug(`CustomStamina: Value for 'StaminaExhaustionStartsBreathSound' has been been adjusted from ${stamina.StaminaExhaustionStartsBreathSound} to ${config.StaminaExhaustionStartsBreathSound}.`);
            stamina.StaminaExhaustionStartsBreathSound = config.StaminaExhaustionStartsBreathSound;

            if (debug && stamina.StandupConsumption.x !== config.StandupConsumption.x)
                logger.debug(`CustomStamina: Value for 'StandupConsumption.x' has been been adjusted from ${stamina.StandupConsumption.x} to ${config.StandupConsumption.x}.`);
            stamina.StandupConsumption.x = config.StandupConsumption.x;

            if (debug && stamina.StandupConsumption.y !== config.StandupConsumption.y)
                logger.debug(`CustomStamina: Value for 'StandupConsumption.y' has been been adjusted from ${stamina.StandupConsumption.y} to ${config.StandupConsumption.y}.`);
            stamina.StandupConsumption.y = config.StandupConsumption.y;

            if (debug && stamina.WalkConsumption.x !== config.WalkConsumption.x)
                logger.debug(`CustomStamina: Value for 'WalkConsumption.x' has been been adjusted from ${stamina.WalkConsumption.x} to ${config.WalkConsumption.x}.`);
            stamina.WalkConsumption.x = config.WalkConsumption.x;

            if (debug && stamina.WalkConsumption.y !== config.WalkConsumption.y)
                logger.debug(`CustomStamina: Value for 'WalkConsumption.y' has been been adjusted from ${stamina.WalkConsumption.y} to ${config.WalkConsumption.y}.`);
            stamina.WalkConsumption.y = config.WalkConsumption.y;

            logger.logWithColor("CustomStamina: Breath, leg, and hand stamina has been manually adjusted.", LogTextColor.CYAN, LogBackgroundColor.DEFAULT);
        }
    }

    private calculateRelativePercentage(percentage: number, value: number)
    {
        // Calculate the relative percentage of a value.
        // Example: 50% (increase) to 0.5 = 0.75
        //         -50% (decrease) to 0.5 = 0.25
        const increase = percentage >= 0;
        const differencePercentage = increase ? percentage : percentage * -1;
        const difference = (differencePercentage / 100) * value;
        value = increase ? (value + difference) : (value - difference);
        
        // Round the new value to max 4 decimal places.
        value = Math.round(value * 10000) / 10000;

        return value > 0 ? value : 0;
    }
}

module.exports = { mod: new CustomStamina() }
