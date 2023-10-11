-- Lua
return {
	"Pocco81/true-zen.nvim",
	config = function()
		 require("true-zen").setup {
			-- your config goes here
			-- or just leave it empty :)
      integrations = {
        lualine = true,
        tmux = true,
      }
		 }
	end,
}
