# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # All Vagrant configuration is done here. The most common configuration
  # options are documented and commented below. For a complete reference,
  # please see the online documentation at vagrantup.com.

  config.vm.hostname = "log-aggregate-db-berkshelf"

  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "ubuntu-chef-12.04"

  # The url from where the 'config.vm.box' box will be fetched if it
  # doesn't already exist on the user's system.
  config.vm.box_url = "http://grahamc.com/vagrant/ubuntu-12.04-omnibus-chef.box"

  config.vm.provision :chef_solo do |chef|
    chef.json = {
      postgresql: {
        password: 'postgresql'
      }
    }

    chef.run_list = [
      "nodejs::install_from_binary",
      "postgresql::server"
    ]
  end
end
