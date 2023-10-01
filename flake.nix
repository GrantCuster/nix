{
  description = "Grant's NixOS Flake";

  inputs = {
    # Nixpkgs
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

    # Home manager
    home-manager.url = "github:nix-community/home-manager";
    home-manager.inputs.nixpkgs.follows = "nixpkgs";

    hyprland.url = "github:hyprwm/Hyprland";
  };

  outputs = { nixpkgs, home-manager, ... }@inputs: {
    # Available through 'nixos-rebuild --flake .#bix'
    nixosConfigurations = {
      bix = nixpkgs.lib.nixosSystem {
        specialArgs = { inherit inputs; }; # Pass flake inputs to our config
        modules = [ 
          ./hosts/bix.nix 
          ./system/system.nix 
        ];
      };
    };

    # Available through 'nixos-rebuild --flake .#skybax'
    nixosConfigurations = {
      skybax = nixpkgs.lib.nixosSystem {
        specialArgs = { inherit inputs; }; # Pass flake inputs to our config
        modules = [ 
          ./hosts/skybax.nix 
          ./system/system.nix 
        ];
      };
    };

    # Standalone home-manager configuration entrypoint
    # Available through 'home-manager --flake .#home'
    homeConfigurations = {
      "home" = home-manager.lib.homeManagerConfiguration {
        pkgs = nixpkgs.legacyPackages.x86_64-linux; # Home-manager requires 'pkgs' instance
        extraSpecialArgs = { inherit inputs; }; # Pass flake inputs to our config
        modules = [ ./home/home.nix ];
      };
    };
  };
}

