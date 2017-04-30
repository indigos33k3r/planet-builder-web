var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(position) {
        var _this = this;
        console.log("Create Player");
        _this = _super.call(this, "Player", Game.Scene) || this;
        _this.position = position;
        _this.rotationQuaternion = BABYLON.Quaternion.Identity();
        _this.camPos = new BABYLON.Mesh("Dummy", Game.Scene);
        _this.camPos.parent = _this;
        _this.camPos.position = new BABYLON.Vector3(0, 0, 0);
        _this.camPos.rotationQuaternion = BABYLON.Quaternion.Identity();
        Game.Camera.parent = _this.camPos;
        _this.RegisterControl();
        Player.Instance = _this;
        return _this;
    }
    Player.Position = function () {
        return Player.Instance.position;
    };
    Player.prototype.RegisterControl = function () {
        var _this = this;
        var scene = Game.Scene;
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (event) {
            if (event.sourceEvent.key === "z") {
                _this.forward = true;
            }
            if (event.sourceEvent.key === "s") {
                _this.back = true;
            }
            if (event.sourceEvent.key === "q") {
                _this.left = true;
            }
            if (event.sourceEvent.key === "d") {
                _this.right = true;
            }
            if (event.sourceEvent.keyCode === 32) {
                _this.fly = true;
            }
        }));
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (event) {
            if (event.sourceEvent.key === "z") {
                _this.forward = false;
            }
            if (event.sourceEvent.key === "s") {
                _this.back = false;
            }
            if (event.sourceEvent.key === "q") {
                _this.left = false;
            }
            if (event.sourceEvent.key === "d") {
                _this.right = false;
            }
            if (event.sourceEvent.keyCode === 32) {
                _this.fly = false;
            }
        }));
        Game.Canvas.addEventListener("mousemove", function (event) {
            if (Game.LockedMouse) {
                var movementX = event.movementX;
                var movementY = event.movementY;
                if (movementX > 20) {
                    movementX = 20;
                }
                if (movementX < -20) {
                    movementX = -20;
                }
                if (movementY > 20) {
                    movementY = 20;
                }
                if (movementY < -20) {
                    movementY = -20;
                }
                var rotationPower = movementX / 500;
                var localY = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, Player.Instance.getWorldMatrix());
                var rotation = BABYLON.Quaternion.RotationAxis(localY, rotationPower);
                Player.Instance.rotationQuaternion = rotation.multiply(Player.Instance.rotationQuaternion);
                var rotationCamPower = movementY / 500;
                Player.Instance.camPos.rotate(BABYLON.Axis.X, rotationCamPower, BABYLON.Space.LOCAL);
            }
        });
    };
    Player.GetMovin = function () {
        if (!Player.Instance) {
            return;
        }
        if (Player.Instance.forward) {
            if (Player.CanForward()) {
                var localZ = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Z, Player.Instance.getWorldMatrix());
                Player.Instance.position.addInPlace(localZ.multiply(MeshTools.FloatVector(0.05)));
            }
        }
        if (Player.Instance.back) {
            var localZ = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Z, Player.Instance.getWorldMatrix());
            Player.Instance.position.addInPlace(localZ.multiply(MeshTools.FloatVector(-0.05)));
        }
        if (Player.Instance.right) {
            var localX = BABYLON.Vector3.TransformNormal(BABYLON.Axis.X, Player.Instance.getWorldMatrix());
            Player.Instance.position.addInPlace(localX.multiply(MeshTools.FloatVector(0.05)));
        }
        if (Player.Instance.left) {
            var localX = BABYLON.Vector3.TransformNormal(BABYLON.Axis.X, Player.Instance.getWorldMatrix());
            Player.Instance.position.addInPlace(localX.multiply(MeshTools.FloatVector(-0.05)));
        }
    };
    Player.StillStanding = function () {
        if (!Player.Instance) {
            return;
        }
        var currentUp = BABYLON.Vector3.Normalize(BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, Player.Instance.getWorldMatrix()));
        var targetUp = BABYLON.Vector3.Normalize(Player.Instance.position);
        var correctionAxis = BABYLON.Vector3.Cross(currentUp, targetUp);
        var correctionAngle = Math.abs(Math.asin(correctionAxis.length()));
        if (Player.Instance.fly) {
            Player.Instance.position.addInPlace(targetUp.multiply(MeshTools.FloatVector(0.05)));
        }
        else {
            var gravity = Player.DownRayCast();
            if (gravity !== 0) {
                Player.Instance.position.addInPlace(targetUp.multiply(MeshTools.FloatVector(gravity * 0.05)));
            }
        }
        if (correctionAngle > 0.001) {
            var rotation = BABYLON.Quaternion.RotationAxis(correctionAxis, correctionAngle / 5);
            Player.Instance.rotationQuaternion = rotation.multiply(Player.Instance.rotationQuaternion);
        }
    };
    Player.DownRayCast = function () {
        var pos = Player.Instance.position;
        var dir = BABYLON.Vector3.Normalize(BABYLON.Vector3.Zero().subtract(Player.Instance.position));
        var ray = new BABYLON.Ray(pos, dir, 1.6);
        var hit = Game.Scene.pickWithRay(ray, function (mesh) {
            return mesh !== Player.Instance.model;
        });
        if (!hit.pickedPoint) {
            return -1;
        }
        var d = hit.pickedPoint.subtract(pos).length();
        if (d < 1.5) {
            return 1;
        }
        return 0;
    };
    Player.CanForward = function () {
        var pos = Player.Instance.position;
        var localZ = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Z, Player.Instance.getWorldMatrix());
        var ray = new BABYLON.Ray(pos, localZ, 1);
        var hit = Game.Scene.pickWithRay(ray, function (mesh) {
            return mesh !== Player.Instance.model;
        });
        if (hit.pickedPoint) {
            return false;
        }
        return true;
    };
    return Player;
}(BABYLON.Mesh));