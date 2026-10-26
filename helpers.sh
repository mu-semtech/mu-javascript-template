# Regular rsync command using options optimized to copy local files or files
# from mounted volumes in a Docker container
# Additional rsync options can be passed as argument
function docker-rsync() {
  # Common use:
  #  SOURCE_DIR=$1
  #  TARGET_DIR=$2
  #
  # As a reminder if SOURCE_DIR ends with '/', it copies the files from SOURCE_DIR into
  # TARGET_DIR. If it doesn't end with '/', it copies SOURCE_DIR itself into TARGET_DIR.

  # Used rsync options:
  # -a: archive, -H: preserve hard links, -A: preserve ACL, -W: no delta transfer
  # -X: extended attributes, -S: efficient sparse files
  # --numeric-ids: use uuid by number instead of by name
  # --info: silent output
  # --no-compress: no compression algorithm
  # --filter='-x security.selinux': don't copy SELinux labels, which fails and
  #   spams the log on SELinux hosts such as OpenShift nodes
  #
  # When running as an arbitrary non-root user (e.g. OpenShift), files created at
  # build time are owned by root and only group writable: their permissions and
  # directory and link times can't be changed, so don't try.
  local non_root_options=()
  if [ "$(id -u)" != "0" ]
  then
    non_root_options=(--no-perms --omit-dir-times --omit-link-times)
  fi
  rsync -aHAWXS --numeric-ids --info= --no-compress --filter='-x security.selinux' "${non_root_options[@]}" "$@"
}
