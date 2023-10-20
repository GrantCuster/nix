# This is your home-manager configuration file
# Use this to configure your home environment (it replaces ~/.config/nixpkgs/home.nix)

{ inputs, lib, config, pkgs, ... }: {
  # You can import other home-manager modules here
  imports = [
    # If you want to use home-manager modules from other flakes (such as nix-colors):
    # inputs.nix-colors.homeManagerModule
    inputs.hyprland.homeManagerModules.default
    {wayland.windowManager.hyprland.enable = true;}

    # You can also split up your configuration and import pieces of it here:
    # ./nvim.nix
  ];

  nixpkgs = {
    # You can add overlays here
    overlays = [
      # If you want to use overlays exported from other flakes:
      # neovim-nightly-overlay.overlays.default

      # Or define it inline, for example:
      # (final: prev: {
      #   hi = final.hello.overrideAttrs (oldAttrs: {
      #     patches = [ ./change-hello-to-hi.patch ];
      #   });
      # })
    ];
    # Configure your nixpkgs instance
    config = {
      # Disable if you don't want unfree packages
      allowUnfree = true;
      # Workaround for https://github.com/nix-community/home-manager/issues/2942 
      allowUnfreePredicate = (_: true);
    };
  };

  home = {
    username = "grant";
    homeDirectory = "/home/grant";
  };

  # Add stuff for your user as you see fit:
  # programs.neovim.enable = true;
  home.packages = with pkgs; [ 
    google-chrome
    obsidian
    neovim
    rofi-wayland-unwrapped
    jq
    wl-clipboard
    xfce.thunar
    gcc
    ripgrep
    fd
    lazygit
    unzip
    wget
    spotify-tui
    nodejs_20
    swww
    ripdrag
    spotify
    hugo
    websocat
    slurp
    grim
    acpi
    qmk
    usbutils
    inotify-tools
    imagemagick
    ffmpeg
    wf-recorder
    bc
    autojump
    lazygit
    tmux
    screen
    libinput-gestures
    mods
    lf
    brotab
    fzf
    xdotool
    htop
    btop

    (nerdfonts.override { fonts = [ "JetBrainsMono" ]; })

    (writeShellScriptBin "system_menu" (builtins.readFile ./scripts/system_menu))
    (writeShellScriptBin "fzf_system_menu" (builtins.readFile ./scripts/fzf_system_menu))
    (writeShellScriptBin "fzf_app_menu" (builtins.readFile ./scripts/fzf_app_menu))
    (writeShellScriptBin "workspace_switcher" (builtins.readFile ./scripts/workspace_switcher))
    (writeShellScriptBin "waybar_reload" (builtins.readFile ./scripts/waybar_reload))
    (writeShellScriptBin "rofi_keybinds" (builtins.readFile ./scripts/rofi_keybinds))
    (writeShellScriptBin "use_browser" (builtins.readFile ./scripts/use_browser))
    (writeShellScriptBin "save_history" (builtins.readFile ./scripts/save_history))
    (writeShellScriptBin "start_workspace_timer" (builtins.readFile ./scripts/start_workspace_timer))
    (writeShellScriptBin "back_to_workspace" (builtins.readFile ./scripts/back_to_workspace))
    (writeShellScriptBin "get_workspace_elapsed_time" (builtins.readFile ./scripts/get_workspace_elapsed_time))
    (writeShellScriptBin "get_current_workspace_time" (builtins.readFile ./scripts/get_current_workspace_time))
    (writeShellScriptBin "restart_current_workspace_timer" (builtins.readFile ./scripts/restart_current_workspace_timer))
    (writeShellScriptBin "clear_current_workspace_timer" (builtins.readFile ./scripts/clear_current_workspace_timer))
    (writeShellScriptBin "json_recent_workspaces" (builtins.readFile ./scripts/json_recent_workspaces))
    (writeShellScriptBin "go_home_space" (builtins.readFile ./scripts/go_home_space))
    (writeShellScriptBin "rename_workspace" (builtins.readFile ./scripts/rename_workspace))
    (writeShellScriptBin "refresh_ui_websocket" (builtins.readFile ./scripts/refresh_ui_websocket))
    (writeShellScriptBin "watch_file_command" (builtins.readFile ./scripts/watch_file_command))
    (writeShellScriptBin "watch_todos" (builtins.readFile ./scripts/watch_todos))
    (writeShellScriptBin "watch_system_ideas" (builtins.readFile ./scripts/watch_system_ideas))
    (writeShellScriptBin "watch_screenshots" (builtins.readFile ./scripts/watch_screenshots))
    (writeShellScriptBin "start_home_scripts" (builtins.readFile ./scripts/start_home_scripts))
    (writeShellScriptBin "position_home_bar" (builtins.readFile ./scripts/position_home_bar))
    (writeShellScriptBin "battery_status_json" (builtins.readFile ./scripts/battery_status_json))
    (writeShellScriptBin "restart_home" (builtins.readFile ./scripts/restart_home))
    (writeShellScriptBin "hyprcwd" (builtins.readFile ./scripts/hyprcwd))
    (writeShellScriptBin "hyprshot" (builtins.readFile ./scripts/hyprshot))
    (writeShellScriptBin "hyprrecord" (builtins.readFile ./scripts/hyprrecord))
    (writeShellScriptBin "resize_window_percent" (builtins.readFile ./scripts/resize_window_percent))
    (writeShellScriptBin "browserapp" (builtins.readFile ./scripts/browserapp))
    (writeShellScriptBin "record_region" (builtins.readFile ./scripts/record_region))
    (writeShellScriptBin "record_window" (builtins.readFile ./scripts/record_window))
    (writeShellScriptBin "giffify" (builtins.readFile ./scripts/giffify))
    (writeShellScriptBin "last_recording_to_gif" (builtins.readFile ./scripts/last_recording_to_gif))
    (writeShellScriptBin "restart_libinput_gestures" (builtins.readFile ./scripts/restart_libinput_gestures))
    (writeShellScriptBin "back_one_recent" (builtins.readFile ./scripts/back_one_recent))
    (writeShellScriptBin "forward_one_recent" (builtins.readFile ./scripts/forward_one_recent))
    (writeShellScriptBin "set_workspace_created_at" (builtins.readFile ./scripts/set_workspace_created_at))
    (writeShellScriptBin "minimize" (builtins.readFile ./scripts/minimize))
    (writeShellScriptBin "pin" (builtins.readFile ./scripts/pin))
    (writeShellScriptBin "switch_window" (builtins.readFile ./scripts/switch_window))
  ];

  home.sessionVariables = {
    EDITOR = "nvim";
  };

  programs.kitty.enable = true;

  programs.alacritty = {
    enable = true;
    settings.font.normal.family = "JetBrainsMonoNL Nerd Font Mono";
    settings.font.size = 11;
    settings.window.padding = {
      x = 8;
      y = 6;
    };
    settings.colors = {
      primary.background = "0x282828";
      primary.foreground = "0xebdbb2";
      normal = {
        black = "0x282828";
        red = "0xcc241d";
        green =   "0x98971a";
        yellow =  "0xd79921";
        blue =    "0x458588";
        magenta = "0xb16286";
        cyan =    "0x689d6a";
        white =   "0xa89984";
      };
      bright = { 
        black=   "0x928374";
        red=     "0xfb4934";
        green=   "0xb8bb26";
        yellow=  "0xfabd2f";
        blue=    "0x83a598";
        magenta= "0xd3869b";
        cyan=    "0x8ec07c";
        white=   "0xebdbb2";
      };
    };
  };

  programs.zsh = {
    enable = true;
    enableCompletion = true;
    enableAutosuggestions = true;
    shellAliases = {
      b = "browserapp";
      t = "tmux new-session -A -s $(pwd | awk -F / '{print $NF}')";
      };
   # oh my zsh gets us substring search
    # the option for enabling it separately was not working for me
    oh-my-zsh.enable = true;
    oh-my-zsh.plugins = [
      "autojump"
    ];
  };

  programs.waybar = {
    enable = true;
    systemd.enable = true;
    package = pkgs.waybar.overrideAttrs (oldAttrs: {
      mesonFlags = oldAttrs.mesonFlags ++ [ "-Dexperimental=true" ];
    });
  };
  programs.starship = {
    enable = true;
    enableZshIntegration = true;
    settings = {
      add_newline = false;
      line_break.disabled = true;
    };
  };

  programs.git = {
    enable = true;
    userName = "Grant Custer";
    userEmail = "grantcuster@gmail.com";
  };

  wayland.windowManager.hyprland.extraConfig = (builtins.readFile ./hyprland/hyprland.conf);

  # Wayland config
  # Out of store symlink probably not necessary
  xdg.configFile.waybar = {
    source = config.lib.file.mkOutOfStoreSymlink "${config.home.homeDirectory}/nix/home/waybar";
    recursive = true;
  };

  # Wayland config
  # Out of store symlink probably not necessary
  xdg.configFile.rofi = {
    source = config.lib.file.mkOutOfStoreSymlink "${config.home.homeDirectory}/nix/home/rofi";
    recursive = true;
  };

  # Neovim config use lazyvim
  # Out of store symlink keeps it writable for lazyvim
  xdg.configFile.nvim = {
    source = config.lib.file.mkOutOfStoreSymlink "${config.home.homeDirectory}/nix/home/nvim";
    recursive = true;
  };

  # Custom status bar and home screen
  xdg.configFile.home-ui = {
    source = config.lib.file.mkOutOfStoreSymlink "${config.home.homeDirectory}/nix/home/home-ui";
    recursive = true;
  };

  xdg.configFile.tmux = {
    source = config.lib.file.mkOutOfStoreSymlink "${config.home.homeDirectory}/nix/home/tmux";
    recursive = true;
  };

  xdg.configFile."libinput-gestures.conf" = {
    source = config.lib.file.mkOutOfStoreSymlink "${config.home.homeDirectory}/nix/home/libinput-gestures/libinput-gestures.conf";
  };

  # Enable home-manager and git
  programs.home-manager.enable = true;

  # Nicely reload system units when changing configs
  systemd.user.startServices = "sd-switch";

  services.dunst.enable = true;
  services.dunst.settings =  {
    global = {
      width = 300;
      padding = 12;
      horizontal_padding = 12;
      offset = "0x-0";
      frame_color = "#ebdbb2";
      frame_width = 0;
      font = "JetBrainsMonoNL Nerd Font Mono 10";
    };

    urgency_normal = {
      background = "#ebdbb2";
      foreground = "#282828";
      timeout = 10;
    };
  };

 services.spotifyd = {
   enable = true;
   settings =
     {
       global = {
         username = "1257825754";
         password = "dLj403RcVZmy";
       };
     };
 };

  # https://nixos.wiki/wiki/FAQ/When_do_I_update_stateVersion
  home.stateVersion = "23.05";
}
